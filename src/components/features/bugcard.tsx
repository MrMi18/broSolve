import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, ThumbsUp, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import VoteButton from './VoteButton'


interface BugCardProps {
  bug: {
    id: string
    title: string
    description: string
    tags: string[]
    status: 'open' | 'answered' | 'solved' | 'closed'
    createdBy: string
    createdAt: any
    votes?: number
    answerCount?: number
  }
}

export function BugCard({ bug }: BugCardProps) {
  
  const router = useRouter();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'answered': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'solved': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  }
console.log(bug)
  return (
    <Card onClick={() => router.push(`/bugs/${bug.id}`)} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {bug.title}
          </CardTitle>
          <Badge className={getStatusColor(bug.status)}>
            {bug.status}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {bug.tags.slice(0, 5).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {bug.tags.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{bug.tags.length - 5}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 line-clamp-3 mb-4">
          {bug.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{bug.createdBy}</span>
              
              
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(bug.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 " >
              <VoteButton
                targetId={bug.id}
                targetType="bug"
                parentId={bug.id}
                initialVotes={bug.votes || 0}
                onVoteUpdate={(vote) => vote + 1}

              />
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{bug.answerCount || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}