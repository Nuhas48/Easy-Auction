'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTournaments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getTournament(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createTournament(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tournaments')
    .insert({
      name: formData.get('name') as string,
      sport: formData.get('sport') as string,
      max_teams: parseInt(formData.get('max_teams') as string),
      max_players: parseInt(formData.get('max_players') as string),
      team_budget: parseFloat(formData.get('team_budget') as string),
      base_bid_increment: parseFloat(formData.get('base_bid_increment') as string),
      bid_timer_seconds: parseInt(formData.get('bid_timer_seconds') as string),
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard')
  return data
}

export async function updateTournamentStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tournaments')
    .update({ status })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard')
}