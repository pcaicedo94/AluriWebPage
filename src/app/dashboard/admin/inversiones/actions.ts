'use server'

import { createClient } from '../../../../utils/supabase/server'

export interface PendingInvestment {
  id: string
  amount_invested: number
  created_at: string
  investor: {
    full_name: string | null
    email: string | null
    document_id: string | null
  } | null
  loan: {
    code: string
    amount_requested: number | null
  } | null
}

export async function getPendingInvestments(): Promise<{ data: PendingInvestment[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('investments')
    .select(`
      id,
      amount_invested,
      created_at,
      investor:profiles!investor_id (
        full_name,
        email,
        document_id
      ),
      loan:loans!loan_id (
        code,
        amount_requested
      )
    `)
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending investments:', error.message)
    return { data: [], error: error.message }
  }

  return { data: data as unknown as PendingInvestment[], error: null }
}
