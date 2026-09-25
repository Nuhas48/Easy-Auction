'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPlayers(tournamentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players')
    .select('*, teams(name)')
    .eq('tournament_id', tournamentId)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data
}

export async function getPlayer(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players')
    .select('*, teams(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createPlayer(formData: FormData) {
  const supabase = await createClient()

  const photoFile = formData.get('photo') as File
  let photoUrl = null

  if (photoFile && photoFile.size > 0) {
    const fileName = `${Date.now()}-${photoFile.name}`
    const { data: uploadData } = await supabase.storage
      .from('player-photos')
      .upload(fileName, photoFile)

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from('player-photos')
        .getPublicUrl(fileName)
      photoUrl = urlData.publicUrl
    }
  }

  const stats = {
    matches: parseInt(formData.get('matches') as string) || 0,
    // Add sport-specific stats
    runs: parseInt(formData.get('runs') as string) || 0,
    wickets: parseInt(formData.get('wickets') as string) || 0,
    goals: parseInt(formData.get('goals') as string) || 0,
    assists: parseInt(formData.get('assists') as string) || 0,
  }

  const { data, error } = await supabase
    .from('players')
    .insert({
      tournament_id: formData.get('tournament_id') as string,
      name: formData.get('name') as string,
      photo_url: photoUrl,
      department: formData.get('department') as string,
      category: formData.get('category') as string,
      stats: stats,
      base_price: parseFloat(formData.get('base_price') as string),
      display_order: parseInt(formData.get('display_order') as string) || 0,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/players')
  return data
}

export async function updatePlayerStatus(
  id: string,
  status: string,
  soldToTeamId?: string,
  soldPrice?: number
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('players')
    .update({
      status,
      sold_to_team_id: soldToTeamId || null,
      sold_price: soldPrice || null,
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/auction')
}

export async function deletePlayer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/players')
}