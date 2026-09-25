import { createClient } from '@/lib/supabase/server'
import { getTournaments } from '@/lib/actions/tournaments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Trophy } from 'lucide-react'
import CreateTournamentDialog from '@/components/tournaments/CreateTournamentDialog'

export default async function DashboardPage() {
  const tournaments = await getTournaments()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Tournaments</h1>
          <p className="text-slate-400">Manage your auction tournaments</p>
        </div>
        <CreateTournamentDialog />
      </div>

      {tournaments.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tournaments yet</h3>
            <p className="text-slate-400 mb-4">Create your first tournament to get started</p>
            <CreateTournamentDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{tournament.name}</CardTitle>
                    <CardDescription className="capitalize">{tournament.sport}</CardDescription>
                  </div>
                  <Badge 
                    variant={tournament.status === 'live' ? 'default' : 'secondary'}
                    className={tournament.status === 'live' ? 'bg-green-600' : ''}
                  >
                    {tournament.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-400">
                  <p>Max Teams: {tournament.max_teams}</p>
                  <p>Max Players: {tournament.max_players}</p>
                  <p>Team Budget: ৳{tournament.team_budget.toLocaleString()}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/dashboard/tournaments/${tournament.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">Manage</Button>
                  </Link>
                  {tournament.status !== 'completed' && (
                    <Link href={`/auction/${tournament.id}`} className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        {tournament.status === 'live' ? 'Join Auction' : 'Start Auction'}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}