'use client'

import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, ThumbsUp, ThumbsDown, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  targetId: string
  targetType: 'bug' | 'answer'
  parentId?: string // For answer votes, we need the parent bug ID
  initialVotes: number
  onVoteUpdate: (newCount: number) => void
  className?: string
}

export default function VoteButton({    
  targetId,
  targetType,
  parentId,
  initialVotes,
  onVoteUpdate,
  className
}: VoteButtonProps) {
  const { user } = useAuth()
 
  const [votes, setVotes] = useState(initialVotes)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user's current vote status
  useEffect(() => {
    if (user) {
      fetchUserVote()
    }
  }, [user, targetId])

  const fetchUserVote = async () => {
    try {
      // Get auth token
      const token = await user?.getIdToken()
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/votes/status?targetId=${targetId}&targetType=${targetType}`, {
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserVote(data.userVote)
      }
    } catch (error) {
      console.error('Error fetching vote status:', error)
    }
  }

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please login to vote')
      return
    }

    if (isLoading) return

    setIsLoading(true)

    // Optimistic update
    const previousVote = userVote
    const previousVotes = votes

    // Calculate new vote count
    let newVotes = votes
    let newUserVote: 'up' | 'down' | null = voteType

    if (previousVote === voteType) {
      // Remove vote (clicking same button)
      newUserVote = null
      newVotes = voteType === 'up' ? votes - 1 : votes + 1
    } else if (previousVote) {
      // Change vote (from up to down or vice versa)
      newVotes = voteType === 'up' ? votes + 2 : votes - 2
    } else {
      // New vote
      newVotes = voteType === 'up' ? votes + 1 : votes - 1
    }

    // Update UI immediately (optimistic)
    setUserVote(newUserVote)
    setVotes(newVotes)

    try {
      // Get auth token
      const token = await user?.getIdToken()
      
      const requestBody: any = {
        targetId,
        targetType,
        voteType: newUserVote, // null means remove vote
      }

      // Add parentId for answer votes
      if (targetType === 'answer' && parentId) {
        requestBody.parentId = parentId
      }

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      const result = await response.json()
      
      // Update with server response (in case of discrepancy)
      setVotes(result.newVoteCount)
      
      // Call the parent's vote update handler
      onVoteUpdate(result.newVoteCount)
      
    } catch (error) {
      // Revert optimistic update on error
      setUserVote(previousVote)
      setVotes(previousVotes)
      
      console.error('Error voting:', error)
      toast.error('Failed to vote. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Render different UI based on targetType
  if (targetType === 'bug') {
    // Bug voting: Only show like button (upvote only)
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            handleVote('up');
            e.stopPropagation();
          }}
          disabled={isLoading || !user}
          className={cn(
            "h-8 px-3 py-1 hover:bg-red-100 hover:text-red-600 transition-colors text-red-500",
            userVote === 'up' && "bg-red-100 text-red-600"
          )}
        >
          <Heart className={cn(
            "h-4 w-4 mr-1",
            userVote === 'up' && "fill-current"
          )} />
          <span className="text-sm font-medium">
            {votes > 0 ? votes : 0}
          </span>
        </Button>
      </div>
    )
  }

  // Answer voting: Show both upvote and downvote
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('up')}
        disabled={isLoading || !user}
        className={cn(
          "h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 text-green-600",
          userVote === 'up' && "bg-green-100 text-green-600"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      
      <span className={cn(
        "text-sm font-medium tabular-nums min-w-[2rem] text-center text-gray-400",
        votes > 0 && "text-green-600",
        votes < 0 && "text-red-600"
      )}>
        {votes}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('down')}
        disabled={isLoading || !user}
        className={cn(
          "h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 text-red-600",
          userVote === 'down' && "bg-red-100 text-red-600"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
}