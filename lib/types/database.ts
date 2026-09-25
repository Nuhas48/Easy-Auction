export type Tournament = {
  id: string
  name: string
  sport: string
  status: 'upcoming' | 'live' | 'completed'
  max_teams: number
  max_players: number
  team_budget: number
  base_bid_increment: number
  bid_timer_seconds: number
  created_by: string
  created_at: string
}

export type Team = {
  id: string
  tournament_id: string
  name: string
  logo_url: string | null
  color_theme: string
  manager_name: string
  manager_email: string
  manager_user_id: string | null
  total_budget: number
  created_at: string
}

export type Player = {
  id: string
  tournament_id: string
  name: string
  photo_url: string | null
  department: string | null
  category: string
  stats: Record<string, any>
  base_price: number
  status: 'available' | 'sold' | 'unsold'
  sold_to_team_id: string | null
  sold_price: number | null
  display_order: number
  created_at: string
}

export type AuctionSession = {
  id: string
  tournament_id: string
  status: 'waiting' | 'live' | 'paused' | 'completed'
  current_player_index: number
  current_player_id: string | null
  current_bid: number
  current_bidder_team_id: string | null
  bid_count: number
  timer_seconds: number
  timer_started_at: string | null
  created_at: string
}

export type Bid = {
  id: string
  session_id: string
  player_id: string
  team_id: string
  amount: number
  created_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'committee' | 'manager'
  created_at: string
}