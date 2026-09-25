'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTeams(tournamentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*, players(count)')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function getTeam(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*, players(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createTeam(formData: FormData) {
  const supabase = await createClient()

  const logoFile = formData.get('logo') as File
  let logoUrl = null

  if (logoFile && logoFile.size > 0) {
    const fileName = `${Date.now()}-${logoFile.name}`
    const { data: uploadData } = await supabase.storage
      .from('team-logos')
      .upload(fileName, logoFile)

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from('team-logos')
        .getPublicUrl(fileName)
      logoUrl = urlData.publicUrl
    }
  }

  const { data, error } = await supabase
    .from('teams')
    .insert({
      tournament_id: formData.get('tournament_id') as string,
      name: formData.get('name') as string,
      logo_url: logoUrl,
      color_theme: formData.get('color_theme') as string,
      manager_name: formData.get('manager_name') as string,
      manager_email: formData.get('manager_email') as string,
      total_budget: parseFloat(formData.get('total_budget') as string),
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/teams')
  return data
}

export async function updateTeamBudget(id: string, total_budget: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('teams')
    .update({ total_budget })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/teams')
}