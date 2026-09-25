import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trophy, Users, Gavel, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            🏆 Easy Auction
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            The ultimate university sports auction platform. 
            Create tournaments, build teams, and run live auctions with real-time bidding.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard 
            icon={<Trophy className="w-8 h-8" />}
            title="Multi-Sport"
            description="Support for Cricket, Football, and more sports"
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8" />}
            title="Team Management"
            description="Create teams with managers, logos, and budgets"
          />
          <FeatureCard 
            icon={<Gavel className="w-8 h-8" />}
            title="Live Auction"
            description="Real-time bidding with countdown timer"
          />
          <FeatureCard 
            icon={<TrendingUp className="w-8 h-8" />}
            title="Analytics"
            description="Track spending and team performance"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition">
      <div className="text-blue-400 mb-4">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  )
}