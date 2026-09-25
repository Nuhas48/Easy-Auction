'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTournament } from '@/lib/actions/tournaments'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export default function CreateTournamentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      await createTournament(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Error creating tournament')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Tournament
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
          <DialogDescription>
            Set up a new auction tournament with your preferred settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tournament Name</Label>
            <Input id="name" name="name" placeholder="Spring Cricket League 2026" required />
          </div>

          <div>
            <Label htmlFor="sport">Sport</Label>
            <Select name="sport" required>
              <SelectTrigger>
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="volleyball">Volleyball</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_teams">Max Teams</Label>
              <Input 
                id="max_teams" 
                name="max_teams" 
                type="number" 
                min="2" 
                max="20" 
                defaultValue="8" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="max_players">Max Players</Label>
              <Input 
                id="max_players" 
                name="max_players" 
                type="number" 
                min="1" 
                max="30" 
                defaultValue="30" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team_budget">Team Budget (৳)</Label>
              <Input 
                id="team_budget" 
                name="team_budget" 
                type="number" 
                min="1000" 
                defaultValue="100000" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="base_bid_increment">Min Bid Increment (৳)</Label>
              <Input 
                id="base_bid_increment" 
                name="base_bid_increment" 
                type="number" 
                min="100" 
                defaultValue="500" 
                required 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bid_timer_seconds">Bid Timer (seconds)</Label>
            <Input 
              id="bid_timer_seconds" 
              name="bid_timer_seconds" 
              type="number" 
              min="10" 
              max="120" 
              defaultValue="30" 
              required 
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Tournament'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}