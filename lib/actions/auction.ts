'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAuctionSession(tournamentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('auction_sessions')
    .select('*, players(*), teams(name)')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createAuctionSession(tournamentId: string) {
  const supabase = await createClient()

  // Get first available player
  const { data: firstPlayer } = await supabase
    .from('players')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('status', 'available')
    .order('display_order', { ascending: true })
    .limit(1)
    .single()

  const { data, error } = await supabase
    .from('auction_sessions')
    .insert({
      tournament_id: tournamentId,
      status: 'live',
      current_player_id: firstPlayer?.id,
      current_bid: 0,
      bid_count: 0,
      timer_started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/auction')
  return data
}

export async function placeBid(sessionId: string, teamId: string, amount: number) {
  const supabase = await createClient()

  // Get current session
  const { data: session } = await supabase
    .from('auction_sessions')
    .select('*, players(base_price)')
    .eq('id', sessionId)
    .single()

  if (!session) throw new Error('Session not found')

  // Validate bid
  const minBid = Math.max(session.current_bid, session.players.base_price)
  if (amount <= minBid) {
    throw new Error(`Bid must be higher than ${minBid}`)
  }

  // Check team budget
  const { data: team } = await supabase
    .from('teams')
    .select('total_budget')
    .eq('id', teamId)
    .single()

  const { data: teamSpent } = await supabase
    .from('players')
    .select('sold_price')
    .eq('sold_to_team_id', teamId)
    .eq('status', 'sold')

  const spent = teamSpent?.reduce((sum, p) => sum + (p.sold_price || 0), 0) || 0
  const remaining = (team?.total_budget || 0) - spent

  if (amount > remaining) {
    throw new Error('Insufficient budget')
  }

  // Insert bid
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      session_id: sessionId,
      player_id: session.current_player_id,
      team_id: teamId,
      amount,
    })

  if (bidError) throw bidError

  // Update session
  const { error: sessionError } = await supabase
    .from('auction_sessions')
    .update({
      current_bid: amount,
      current_bidder_team_id: teamId,
      bid_count: session.bid_count + 1,
      timer_started_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (sessionError) throw sessionError

  revalidatePath('/auction/live')
  return { success: true }
}

export async function sellPlayer(sessionId: string) {
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('*, players(id, base_price)')
    .eq('id', sessionId)
    .single()

  if (!session) throw new Error('Session not found')

  const finalPrice = session.current_bid || session.players.base_price
  const teamId = session.current_bidder_team_id

  if (teamId) {
    // Mark player as sold
    await supabase
      .from('players')
      .update({
        status: 'sold',
        sold_to_team_id: teamId,
        sold_price: finalPrice,
      })
      .eq('id', session.current_player_id)
  } else {
    // Mark as unsold
    await supabase
      .from('players')
      .update({ status: 'unsold' })
      .eq('id', session.current_player_id)
  }

  // Get next player
  const { data: nextPlayer } = await supabase
    .from('players')
    .select('id')
    .eq('tournament_id', session.tournament_id)
    .eq('status', 'available')
    .order('display_order', { ascending: true })
    .limit(1)
    .single()

  if (nextPlayer) {
    // Move to next player
    await supabase
      .from('auction_sessions')
      .update({
        current_player_id: nextPlayer.id,
        current_bid: 0,
        current_bidder_team_id: null,
        bid_count: 0,
        timer_started_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
  } else {
    // Auction complete
    await supabase
      .from('auction_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId)

    await supabase
      .from('tournaments')
      .update({ status: 'completed' })
      .eq('id', session.tournament_id)
  }

  revalidatePath('/auction/live')
  return { success: true, nextPlayer: !!nextPlayer }
}

export async function skipPlayer(sessionId: string) {
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) throw new Error('Session not found')

  // Mark current as unsold
  await supabase
    .from('players')
    .update({ status: 'unsold' })
    .eq('id', session.current_player_id)

  // Get next player
  const { data: nextPlayer } = await supabase
    .from('players')
    .select('id')
    .eq('tournament_id', session.tournament_id)
    .eq('status', 'available')
    .order('display_order', { ascending: true })
    .limit(1)
    .single()

  if (nextPlayer) {
    await supabase
      .from('auction_sessions')
      .update({
        current_player_id: nextPlayer.id,
        current_bid: 0,
        current_bidder_team_id: null,
        bid_count: 0,
        timer_started_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
  } else {
    await supabase
      .from('auction_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId)
  }

  revalidatePath('/auction/live')
  return { success: true, nextPlayer: !!nextPlayer }
}

export async function getBidHistory(sessionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bids')
    .select('*, teams(name, color_theme)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data
}