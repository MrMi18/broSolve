"use client"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import VoteButton from './VoteButton'
import { collection, doc, getDoc, getDocs, query, Timestamp } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { db } from '@/lib/firebase'

interface BugCardProps {
  bug: {
    id: string
    title: string
    description: string
    tags: string[]
    status: 'open' | 'answered' | 'solved' | 'closed'
    createdBy: string
    createdAt: Timestamp
    votes?: number
    answerCount?: number
  }
}


export default function BugCard({ bug }: BugCardProps) {
  const router = useRouter();
  const [answerSize,setAnswerSize]  = useState(0);
  const [submitedBy,setSubmittedBy]  = useState();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
      case 'answered': return 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
      case 'solved': return 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
    }
  }
  const fetchAnswers = useCallback(async () => {
    const answersQuery = query(
      collection(db, 'bugs', bug.id, 'answers'),
    )
    const querySnapshot = await getDocs(answersQuery)
    setAnswerSize(querySnapshot.docs.length || 0)


     const userDetails = await getDoc(doc(db, 'users', bug.createdBy));
    if (userDetails.exists()) {
        const userData = userDetails.data() 
        setSubmittedBy(userData.username || userData.email)
     
    }
    

  }, [bug.id])
  useEffect(()=>{
    fetchAnswers();
  }, [bug.id,fetchAnswers])
  const formatTime = (
    timestamp: Timestamp | Date | string | number | null | undefined
  ) => {
    if (!timestamp) return 'Just now';
    let date: Date;
    if (
      typeof timestamp === 'object' &&
      timestamp !== null &&
      'toDate' in timestamp &&
      typeof (timestamp as Timestamp).toDate === 'function'
    ) {
      date = (timestamp as Timestamp).toDate();
    } else {
      date = new Date(timestamp as string | number | Date);
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card 
      onClick={() => router.push(`/bugs/${bug.id}`)} 
      className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
    >
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 flex-1">
            {bug.title}
          </CardTitle>
          <Badge className={`${getStatusColor(bug.status)} font-medium px-3 py-1 rounded-lg text-xs uppercase tracking-wide transition-all duration-200 flex-shrink-0`}>
            {bug.status}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {bug.tags.slice(0, 4).map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-lg px-2 py-1 font-medium transition-colors duration-200"
            >
              #{tag}
            </Badge>
          ))}
          {bug.tags.length > 4 && (
            <Badge 
              variant="secondary" 
              className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-lg px-2 py-1 font-medium"
            >
              +{bug.tags.length - 4} more
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
          {bug.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium">{submitedBy || bug.createdBy}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatTime(bug.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <VoteButton
                targetId={bug.id}
                targetType="bug"
                parentId={bug.id}
                initialVotes={bug.votes || 0}
                onVoteUpdate={(vote) => vote + 1}
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-green-600 hover:bg-green-100 rounded-lg px-3 py-2 bg-gray-100 transition-colors duration-200">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{answerSize}</span>
              <span className="text-xs">{answerSize === 1 ? 'answer' : 'answers'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}














