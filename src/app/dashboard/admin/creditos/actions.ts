'use server'

import { createClient } from '../../../../utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export interface LoanData {
  id: string
  code: string
  deudor: string | null
  amount_requested: number | null
  status: string
  valor_garantia: number | null
  days_past_due: number | null
}

export async function getLoans(): Promise<{ data: LoanData[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('admin_loans_dashboard')
    .select('id, code, deudor, amount_requested, status, valor_garantia, days_past_due')
    .order('code', { ascending: true })

  if (error) {
    console.error('Error fetching loans:', error.message)
    return { data: null, error: error.message }
  }

  return { data: data as LoanData[], error: null }
}

// Get propietarios for the select dropdown
export interface Propietario {
  id: string
  full_name: string | null
  email: string | null
}

export async function getPropietarios(): Promise<{ data: Propietario[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'propietario')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching propietarios:', error.message)
    return { data: null, error: error.message }
  }

  return { data: data as Propietario[], error: null }
}

// Interfaces for creating a loan
export interface PropertyInfo {
  address: string
  city: string
  commercial_value: number
  registration_number: string
}

export interface LoanDates {
  signature_date: string | null
  disbursement_date: string | null
  estimated_date: string | null
}

export interface Cosigner {
  full_name: string
  cedula: string
  email: string
  phone: string
}

export interface CreateLoanData {
  borrower_id: string
  code: string
  property_info: PropertyInfo
  amount_requested: number
  interest_rate_nm: number
  interest_rate_ea: number
  term_months: number
  payment_type: 'interest_only' | 'principal_and_interest'
  dates: LoanDates
  cosigners: Cosigner[]
}

export async function createLoan(data: CreateLoanData): Promise<{ success: boolean; error?: string; loanId?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: 'Configuracion del servidor incompleta.' }
  }

  const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey)

  // Validation
  if (!data.borrower_id || !data.code || !data.amount_requested) {
    return { success: false, error: 'Faltan campos obligatorios (deudor, codigo, monto).' }
  }

  // Build workflow_dates JSON with null for signature/disbursement (set when funding completes)
  const workflowDates = {
    signature_date: null,
    disbursement_date: null,
    estimated_date: data.dates.estimated_date || null
  }

  // 1. Insert the loan
  const { data: loan, error: loanError } = await supabaseAdmin
    .from('loans')
    .insert({
      owner_id: data.borrower_id,
      code: data.code,
      property_info: data.property_info,
      amount_requested: data.amount_requested,
      interest_rate_nm: data.interest_rate_nm,
      interest_rate_ea: data.interest_rate_ea,
      term_months: data.term_months,
      payment_type: data.payment_type,
      workflow_dates: workflowDates,
      status: 'draft'
    })
    .select('id')
    .single()

  if (loanError) {
    console.error('Error creating loan:', loanError.message)
    return { success: false, error: 'Error al crear el credito: ' + loanError.message }
  }

  const loanId = loan.id

  // 2. Insert cosigners if any
  if (data.cosigners && data.cosigners.length > 0) {
    const cosignersToInsert = data.cosigners
      .filter(c => c.full_name && c.cedula) // Only insert valid cosigners
      .map(cosigner => ({
        loan_id: loanId,
        full_name: cosigner.full_name,
        document_id: cosigner.cedula,
        email: cosigner.email || null,
        phone: cosigner.phone || null
      }))

    if (cosignersToInsert.length > 0) {
      const { error: cosignersError } = await supabaseAdmin
        .from('loan_cosigners')
        .insert(cosignersToInsert)

      if (cosignersError) {
        console.error('Error creating cosigners:', cosignersError.message)
        // Don't fail the whole operation, just log the error
      }
    }
  }

  revalidatePath('/dashboard/admin/creditos')

  return { success: true, loanId }
}

// ========== LOAN DETAIL ACTIONS ==========

export interface LoanDetail {
  id: string
  code: string
  status: string
  amount_requested: number | null
  amount_funded: number | null
  interest_rate_nm: number | null
  interest_rate_ea: number | null
  term_months: number | null
  payment_type: string | null
  property_info: PropertyInfo | null
  workflow_dates: LoanDates | null
  created_at: string
  owner: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

export interface LoanCosigner {
  id: string
  full_name: string
  cedula: string
  email: string | null
  phone: string | null
}

export interface LoanInvestment {
  id: string
  amount: number
  status: string
  created_at: string
  investor: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

export async function getLoanById(loanId: string): Promise<{ data: LoanDetail | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('loans')
    .select(`
      id,
      code,
      status,
      amount_requested,
      amount_funded,
      interest_rate_nm,
      interest_rate_ea,
      term_months,
      payment_type,
      property_info,
      workflow_dates,
      created_at,
      owner:profiles!owner_id (
        id,
        full_name,
        email
      )
    `)
    .eq('id', loanId)
    .single()

  if (error) {
    console.error('Error fetching loan:', error.message)
    return { data: null, error: error.message }
  }

  return { data: data as unknown as LoanDetail, error: null }
}

export async function getLoanCosigners(loanId: string): Promise<{ data: LoanCosigner[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('loan_cosigners')
    .select('id, full_name, document_id, email, phone')
    .eq('loan_id', loanId)
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching cosigners:', error.message)
    return { data: [], error: error.message }
  }

  // Map document_id to cedula for frontend compatibility
  const cosigners = (data || []).map(c => ({
    ...c,
    cedula: c.document_id
  }))

  return { data: cosigners as LoanCosigner[], error: null }
}

export async function getLoanInvestments(loanId: string): Promise<{ data: LoanInvestment[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('investments')
    .select(`
      id,
      amount_invested,
      status,
      created_at,
      investor:profiles!investor_id (
        id,
        full_name,
        email
      )
    `)
    .eq('loan_id', loanId)
    .order('created_at', { ascending: false })

  if (error) {
    // Si no hay inversiones, no es un error grave, devolvemos array vacio
    console.warn('Advertencia inversiones:', error.message)
    return { data: [], error: null }
  }

  // Map amount_invested to amount for frontend compatibility
  const investments = (data || []).map(inv => ({
    ...inv,
    amount: inv.amount_invested
  }))

  return { data: investments as unknown as LoanInvestment[], error: null }
}

export async function publishLoan(loanId: string): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: 'Configuracion del servidor incompleta.' }
  }

  const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey)

  // First verify the loan exists and is in draft status
  const { data: loan, error: fetchError } = await supabaseAdmin
    .from('loans')
    .select('id, status')
    .eq('id', loanId)
    .single()

  if (fetchError || !loan) {
    return { success: false, error: 'Credito no encontrado.' }
  }

  if (loan.status !== 'draft') {
    return { success: false, error: 'Solo se pueden publicar creditos en estado borrador.' }
  }

  // Update status to fundraising
  const { error: updateError } = await supabaseAdmin
    .from('loans')
    .update({ status: 'fundraising' })
    .eq('id', loanId)

  if (updateError) {
    console.error('Error publishing loan:', updateError.message)
    return { success: false, error: 'Error al publicar el credito: ' + updateError.message }
  }

  revalidatePath('/dashboard/admin/creditos')
  revalidatePath(`/dashboard/admin/creditos/${loanId}`)

  return { success: true }
}
