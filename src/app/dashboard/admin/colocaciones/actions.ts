'use server'

import { createClient } from '../../../../utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// ========== SEARCH & LOOKUP FUNCTIONS ==========

export interface DebtorSearchResult {
  found: boolean
  id?: string
  full_name?: string
  email?: string
  phone?: string
  address?: string
}

export async function searchDebtorByCedula(cedula: string): Promise<DebtorSearchResult> {
  if (!cedula || cedula.length < 5) {
    return { found: false }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, address')
    .eq('document_id', cedula)
    .single()

  if (error || !data) {
    return { found: false }
  }

  return {
    found: true,
    id: data.id,
    full_name: data.full_name || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || ''
  }
}

export interface InvestorOption {
  id: string
  full_name: string | null
  document_id: string | null
  email: string | null
}

export async function getInvestorsForSelect(): Promise<{ data: InvestorOption[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, document_id, email')
    .eq('role', 'inversionista')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching investors:', error.message)
    return { data: [], error: error.message }
  }

  return { data: data as InvestorOption[], error: null }
}

// ========== FULL LOAN CREATION (TRANSACTIONAL) ==========

export interface NewDebtorData {
  cedula: string
  full_name: string
  email: string
  phone?: string
  address?: string
}

export interface PropertyData {
  address: string
  city: string
  property_type: string
  commercial_value: number
}

export interface InvestorParticipation {
  investor_id: string
  amount: number
  percentage: number
}

export interface FullLoanData {
  // Debtor
  debtor_id?: string // If existing debtor
  new_debtor?: NewDebtorData // If new debtor needs to be created

  // Loan
  code: string
  amount_requested: number
  interest_rate_ea: number
  term_months: number

  // Property
  property: PropertyData

  // Investors
  investors: InvestorParticipation[]
}

export async function createFullLoanRecord(
  data: FullLoanData
): Promise<{ success: boolean; error?: string; loanId?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: 'Configuracion del servidor incompleta.' }
  }

  const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey)

  // Validation
  if (!data.code || !data.amount_requested) {
    return { success: false, error: 'Codigo y monto son obligatorios.' }
  }

  if (!data.debtor_id && !data.new_debtor) {
    return { success: false, error: 'Debe seleccionar o crear un deudor.' }
  }

  // Calculate total investment
  const totalInvestment = data.investors.reduce((sum, inv) => sum + inv.amount, 0)
  if (totalInvestment > data.amount_requested) {
    return { success: false, error: 'El total de inversiones excede el monto del credito.' }
  }

  let debtorId = data.debtor_id

  try {
    // 1. Create debtor if new
    if (!debtorId && data.new_debtor) {
      const { cedula, full_name, email, phone, address } = data.new_debtor

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: `Temp${cedula}!`, // Temporary password
        email_confirm: true,
        user_metadata: {
          full_name,
          document_id: cedula,
          role: 'propietario'
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'El email del deudor ya esta registrado.' }
        }
        return { success: false, error: 'Error al crear usuario deudor: ' + authError.message }
      }

      debtorId = authData.user.id

      // Check if profile was created by trigger, if not create it
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', debtorId)
        .single()

      if (!existingProfile) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: debtorId,
            email: email,
            full_name: full_name,
            document_id: cedula,
            phone: phone || null,
            address: address || null,
            role: 'propietario',
            verification_status: 'verified'
          })

        if (profileError) {
          // Cleanup: delete auth user
          await supabaseAdmin.auth.admin.deleteUser(debtorId)
          return { success: false, error: 'Error al crear perfil del deudor: ' + profileError.message }
        }
      } else {
        // Update existing profile with all data
        await supabaseAdmin
          .from('profiles')
          .update({
            full_name,
            document_id: cedula,
            phone: phone || null,
            address: address || null,
            role: 'propietario'
          })
          .eq('id', debtorId)
      }
    }

    // 2. Create loan
    const propertyInfo = {
      address: data.property.address,
      city: data.property.city,
      property_type: data.property.property_type,
      commercial_value: data.property.commercial_value
    }

    const { data: loan, error: loanError } = await supabaseAdmin
      .from('loans')
      .insert({
        owner_id: debtorId,
        code: data.code,
        amount_requested: data.amount_requested,
        amount_funded: totalInvestment,
        interest_rate_ea: data.interest_rate_ea,
        interest_rate_nm: data.interest_rate_ea / 12,
        term_months: data.term_months,
        payment_type: 'interest_only',
        property_info: propertyInfo,
        status: totalInvestment >= data.amount_requested ? 'active' : 'fundraising',
        workflow_dates: {
          signature_date: new Date().toISOString().split('T')[0],
          disbursement_date: new Date().toISOString().split('T')[0],
          estimated_date: null
        }
      })
      .select('id')
      .single()

    if (loanError) {
      console.error('Error creating loan:', loanError.message)
      return { success: false, error: 'Error al crear credito: ' + loanError.message }
    }

    const loanId = loan.id

    // 3. Create investments
    if (data.investors.length > 0) {
      const investmentsToInsert = data.investors
        .filter(inv => inv.investor_id && inv.amount > 0)
        .map(inv => ({
          loan_id: loanId,
          investor_id: inv.investor_id,
          amount_invested: inv.amount,
          interest_rate_investor: data.interest_rate_ea,
          status: 'active',
          confirmed_at: new Date().toISOString()
        }))

      if (investmentsToInsert.length > 0) {
        const { error: investError } = await supabaseAdmin
          .from('investments')
          .insert(investmentsToInsert)

        if (investError) {
          console.error('Error creating investments:', investError.message)
          // Don't fail the whole operation, loan was created
        }
      }
    }

    revalidatePath('/dashboard/admin/colocaciones')
    revalidatePath('/dashboard/admin/creditos')

    return { success: true, loanId }

  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Error inesperado al crear el registro.' }
  }
}

// ========== GET ALL LOANS FOR TABLE ==========

export interface LoanTableRow {
  id: string
  code: string
  status: string
  amount_requested: number | null
  amount_funded: number | null
  debtor_name: string | null
  debtor_cedula: string | null
  property_city: string | null
  property_value: number | null
  ltv: number | null
  investors: string[]
  created_at: string
}

export async function getAllLoansWithDetails(): Promise<{ data: LoanTableRow[]; error: string | null }> {
  const supabase = await createClient()

  // Get loans with owner info
  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select(`
      id,
      code,
      status,
      amount_requested,
      amount_funded,
      property_info,
      created_at,
      owner:profiles!owner_id (
        full_name,
        document_id
      )
    `)
    .order('created_at', { ascending: false })

  if (loansError) {
    console.error('Error fetching loans:', loansError.message)
    return { data: [], error: loansError.message }
  }

  // Get all investments with investor names
  const { data: investments, error: invError } = await supabase
    .from('investments')
    .select(`
      loan_id,
      investor:profiles!investor_id (
        full_name
      )
    `)
    .eq('status', 'active')

  const investorsByLoan: Record<string, string[]> = {}
  if (!invError && investments) {
    investments.forEach(inv => {
      const loanId = inv.loan_id
      const name = (inv.investor as { full_name: string | null } | null)?.full_name || 'Sin nombre'
      if (!investorsByLoan[loanId]) {
        investorsByLoan[loanId] = []
      }
      if (!investorsByLoan[loanId].includes(name)) {
        investorsByLoan[loanId].push(name)
      }
    })
  }

  // Transform data
  const tableData: LoanTableRow[] = (loans || []).map(loan => {
    const propertyInfo = loan.property_info as { city?: string; commercial_value?: number } | null
    const propertyValue = propertyInfo?.commercial_value || 0
    const amountRequested = loan.amount_requested || 0
    const ltv = propertyValue > 0 ? (amountRequested / propertyValue) * 100 : null

    return {
      id: loan.id,
      code: loan.code,
      status: loan.status,
      amount_requested: loan.amount_requested,
      amount_funded: loan.amount_funded,
      debtor_name: (loan.owner as { full_name: string | null } | null)?.full_name || null,
      debtor_cedula: (loan.owner as { document_id: string | null } | null)?.document_id || null,
      property_city: propertyInfo?.city || null,
      property_value: propertyValue || null,
      ltv,
      investors: investorsByLoan[loan.id] || [],
      created_at: loan.created_at
    }
  })

  return { data: tableData, error: null }
}

// ========== GENERATE NEXT CODE ==========

export async function getNextLoanCode(): Promise<string> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('loans')
    .select('code')
    .order('code', { ascending: false })
    .limit(1)
    .single()

  if (!data?.code) {
    return 'CR-001'
  }

  // Extract number from code like CR-001
  const match = data.code.match(/CR-(\d+)/)
  if (match) {
    const nextNum = parseInt(match[1]) + 1
    return `CR-${nextNum.toString().padStart(3, '0')}`
  }

  return 'CR-001'
}
