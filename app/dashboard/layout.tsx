import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trophy, Users, UserCircle, Settings, LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">🏆 Easy Auction</h1>
        </div>

        <nav className="space-y-2">
          <NavLink href="/dashboard" icon={<Trophy className="w-4 h-4" />}>
            Tournaments
          </NavLink>
          <NavLink href="/dashboard/players" icon={<UserCircle className="w-4 h-4" />}>
            Players
          </NavLink>
          <NavLink href="/dashboard/teams" icon={<Users className="w-4 h-4" />}>
            Teams
          </NavLink>
          <NavLink href="/dashboard/settings" icon={<Settings className="w-4 h-4" />}>
            Settings
          </NavLink>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <form action="/auth/signout" method="post">
            <Button variant="outline" className="w-full justify-start" type="submit">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, icon, children }: { href: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
    >
      {icon}
      {children}
    </Link>
  )
}