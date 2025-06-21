'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, collection, addDoc, query, orderBy, getDocs, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, User, Clock, MessageCircle, ThumbsUp, Send, ThumbsDown, Edit, Trash2, X, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import VoteButton from '@/components/features/VoteButton'
import AiSuggestionSection from '@/components/features/AiSuggestionSection'

interface Bug {
  id: string
  title: string
  description: string
  tags: string[]
  status: 'open' | 'answered' | 'solved' | 'closed'
  createdBy: string
  createdByUserId?: string
  createdAt: any
  votes?: number
}

interface Answer {
  id: string
  content: string
  authorId: string
  authorName?: string
  createdAt: any
  votes?: number
  isAccepted?: boolean
}

interface BugDetailPageProps {
  params: {
    id: string
  }
}

export default function BugDetailPage({ params  }: BugDetailPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [bug, setBug] = useState<Bug | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [answersLoading, setAnswersLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newAnswer, setNewAnswer] = useState('')
  
  // Edit states
  const [editingBug, setEditingBug] = useState(false)
  const [editBugTitle, setEditBugTitle] = useState('')
  const [editBugDescription, setEditBugDescription] = useState('')
  const [editBugTags, setEditBugTags] = useState('')
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null)
  const [editAnswerContent, setEditAnswerContent] = useState('')
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch bug details
  const fetchBug = async () => {
    try {
      setLoading(true)
      const bugDoc = await getDoc(doc(db, 'bugs', params.id))
      
      if (bugDoc.exists()) {
        const bugData = {
          id: bugDoc.id,
          ...bugDoc.data()
        } as Bug
        setBug(bugData)
        
        // Set edit form values
        setEditBugTitle(bugData.title)
        setEditBugDescription(bugData.description)
        setEditBugTags(bugData.tags.join(', '))
      } else {
        toast.error('Bug not found')
        router.push('/bugs')
      }
    } catch (error) {
      console.error('Error fetching bug:', error)
      toast.error('Failed to load bug details')
    } finally {
      setLoading(false)
    }
  }

  // Fetch answers for this bug
  const fetchAnswers = async () => {
    try {
      setAnswersLoading(true)
      const answersQuery = query(
        collection(db, 'bugs', params.id, 'answers'),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(answersQuery)
      const fetchedAnswers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Answer[]
      
      setAnswers(fetchedAnswers)
    } catch (error) {
      console.error('Error fetching answers:', error)
    } finally {
      setAnswersLoading(false)
    }
  }

  // Submit new answer
  const handleSubmitAnswer = async () => {
    if (!user) {
      toast.error('Please log in to submit an answer')
      return
    }

    if (!newAnswer.trim()) {
      toast.error('Please enter an answer')
      return
    }

    try {
      setSubmitting(true)
      
      await addDoc(collection(db, 'bugs', params.id, 'answers'), {
        content: newAnswer.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
        createdAt: serverTimestamp(),
        votes: 0,
        isAccepted: false
      })

      toast.success('Answer submitted successfully!')
      setNewAnswer('')
      fetchAnswers() // Refresh answers
      
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  // Update bug
  const handleUpdateBug = async () => {
    if (!bug || !user) return

    if (!editBugTitle.trim() || !editBugDescription.trim()) {
      toast.error('Title and description are required')
      return
    }

    try {
      setUpdating(true)
      
      const tagsArray = editBugTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      await updateDoc(doc(db, 'bugs', bug.id), {
        title: editBugTitle.trim(),
        description: editBugDescription.trim(),
        tags: tagsArray,
        updatedAt: serverTimestamp()
      })

      toast.success('Bug updated successfully!')
      setEditingBug(false)
      fetchBug() // Refresh bug data
      
    } catch (error) {
      console.error('Error updating bug:', error)
      toast.error('Failed to update bug')
    } finally {
      setUpdating(false)
    }
  }

  // Delete bug
  const handleDeleteBug = async () => {
    if (!bug || !user) return

    if (!confirm('Are you sure you want to delete this bug? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(bug.id)
      
      await deleteDoc(doc(db, 'bugs', bug.id))
      
      toast.success('Bug deleted successfully!')
      router.push('/bugs')
      
    } catch (error) {
      console.error('Error deleting bug:', error)
      toast.error('Failed to delete bug')
    } finally {
      setDeleting(null)
    }
  }

  // Update answer
  const handleUpdateAnswer = async (answerId: string) => {
    if (!user || !editAnswerContent.trim()) {
      toast.error('Answer content is required')
      return
    }

    try {
      setUpdating(true)
      
      await updateDoc(doc(db, 'bugs', params.id, 'answers', answerId), {
        content: editAnswerContent.trim(),
        updatedAt: serverTimestamp()
      })

      toast.success('Answer updated successfully!')
      setEditingAnswerId(null)
      setEditAnswerContent('')
      fetchAnswers() // Refresh answers
      
    } catch (error) {
      console.error('Error updating answer:', error)
      toast.error('Failed to update answer')
    } finally {
      setUpdating(false)
    }
  }

  // Delete answer
  const handleDeleteAnswer = async (answerId: string) => {
    if (!user) return

    if (!confirm('Are you sure you want to delete this answer? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(answerId)
      
      await deleteDoc(doc(db, 'bugs', params.id, 'answers', answerId))
      
      toast.success('Answer deleted successfully!')
      fetchAnswers() // Refresh answers
      
    } catch (error) {
      console.error('Error deleting answer:', error)
      toast.error('Failed to delete answer')
    } finally {
      setDeleting(null)
    }
  }

  // Start editing answer
  const startEditingAnswer = (answer: Answer) => {
    setEditingAnswerId(answer.id)
    setEditAnswerContent(answer.content)
  }

  // Cancel editing
  const cancelEditingAnswer = () => {
    setEditingAnswerId(null)
    setEditAnswerContent('')
  }

  // Cancel editing bug
  const cancelEditingBug = () => {
    setEditingBug(false)
    if (bug) {
      setEditBugTitle(bug.title)
      setEditBugDescription(bug.description)
      setEditBugTags(bug.tags.join(', '))
    }
  }

  // Check if current user can edit/delete the bug
  const canEditBug = user && bug && (bug.createdBy === user.uid)

  // Check if current user can edit/delete an answer
  const canEditAnswer = (answer: Answer) => user && answer.authorId === user.uid

  useEffect(() => {
    if (params.id) {
      fetchBug()
      fetchAnswers()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'answered': return 'bg-blue-100 text-blue-800'
      case 'solved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!bug) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Bug not found</h3>
            <p className="text-gray-500 mb-4">The bug you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/bugs')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.push('/bugs')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Feed
      </Button>

      {/* Bug Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            {editingBug ? (
              <div className="flex-1 space-y-4 pr-4">
                <Input
                  value={editBugTitle}
                  onChange={(e) => setEditBugTitle(e.target.value)}
                  placeholder="Bug title"
                  className="text-xl font-bold"
                />
                <Input
                  value={editBugTags}
                  onChange={(e) => setEditBugTags(e.target.value)}
                  placeholder="Tags (comma separated)"
                />
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold pr-4">
                    {bug.title}
                  </CardTitle>
                  {canEditBug && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBug(true)}
                        disabled={deleting === bug.id}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteBug}
                        disabled={deleting === bug.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === bug.id ? (
                          'Deleting...'
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Badge className={getStatusColor(bug.status)}>
              {bug.status}
            </Badge>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {bug.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Description */}
          {editingBug ? (
            <div className="space-y-4">
              <Textarea
                value={editBugDescription}
                onChange={(e) => setEditBugDescription(e.target.value)}
                placeholder="Bug description"
                rows={6}
                className="resize-none"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdateBug}
                  disabled={updating}
                  size="sm"
                >
                  {updating ? (
                    'Updating...'
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEditingBug}
                  disabled={updating}
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {bug.description}
              </p>
            </div>
          )}
          
          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
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
              <div className="flex items-center space-x-1">
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
                <span>{answers.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    
      <AiSuggestionSection title={bug.title} description={bug.description} />
      
      {/* Add Answer Section */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submit an Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Share your solution or helpful insights..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitAnswer}
                disabled={submitting || !newAnswer.trim()}
              >
                {submitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login Prompt for Non-authenticated Users */}
      {!user && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Want to help solve this bug?</p>
            <Button onClick={() => router.push('/login')}>
              Log in to Submit Answer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Answers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Answers ({answers.length})</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {answersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                  <Separator />
                </div>
              ))}
            </div>
          ) : answers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No answers yet. Be the first to help!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <div key={answer.id}>
                  <div className="space-y-3">
                    {/* Answer Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{answer.authorName || 'Anonymous'}</span>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(answer.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <VoteButton 
                          targetId={answer.id}
                          targetType="answer"
                          parentId={bug.id}
                          initialVotes={answer.votes || 0}
                          onVoteUpdate={(vote) => vote + 1}
                        />
                        
                        {canEditAnswer(answer) && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingAnswer(answer)}
                              disabled={editingAnswerId === answer.id || deleting === answer.id}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAnswer(answer.id)}
                              disabled={deleting === answer.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleting === answer.id ? (
                                'Deleting...'
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Answer Content */}
                    {editingAnswerId === answer.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editAnswerContent}
                          onChange={(e) => setEditAnswerContent(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleUpdateAnswer(answer.id)}
                            disabled={updating}
                            size="sm"
                          >
                            {updating ? (
                              'Updating...'
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={cancelEditingAnswer}
                            disabled={updating}
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {answer.content}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Separator (except for last answer) */}
                  {index < answers.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { doc, getDoc, collection, addDoc, query, orderBy, getDocs, serverTimestamp } from 'firebase/firestore'
// import { db } from '@/lib/firebase'
// import { useAuth } from '@/context/AuthContext'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import { Textarea } from '@/components/ui/textarea'
// import { Skeleton } from '@/components/ui/skeleton'
// import { Separator } from '@/components/ui/separator'
// import { ArrowLeft, User, Clock, MessageCircle, ThumbsUp, Send, ThumbsDown } from 'lucide-react'
// import { formatDistanceToNow } from 'date-fns'
// import { toast } from 'sonner'
// import VoteButton from '@/components/features/VoteButton'
// import AiSuggestionSection from '@/components/features/AiSuggestionSection'

// interface Bug {
//   id: string
//   title: string
//   description: string
//   tags: string[]
//   status: 'open' | 'answered' | 'solved' | 'closed'
//   createdBy: string
//   createdAt: any
//   votes?: number
// }

// interface Answer {
//   id: string
//   content: string
//   authorId: string
//   authorName?: string
//   createdAt: any
//   votes?: number
//   isAccepted?: boolean
// }

// interface BugDetailPageProps {
//   params: {
//     id: string
//   }
// }

// export default function BugDetailPage({ params  }: BugDetailPageProps) {
//   const router = useRouter()
//   const { user } = useAuth()
//   const [bug, setBug] = useState<Bug | null>(null)
//   const [answers, setAnswers] = useState<Answer[]>([])
//   const [loading, setLoading] = useState(true)
//   const [answersLoading, setAnswersLoading] = useState(true)
//   const [submitting, setSubmitting] = useState(false)
//   const [newAnswer, setNewAnswer] = useState('')

//   // Fetch bug details
//   const fetchBug = async () => {
//     try {
//       setLoading(true)
//       const bugDoc = await getDoc(doc(db, 'bugs', params.id))
      
//       if (bugDoc.exists()) {
//         setBug({
//           id: bugDoc.id,
//           ...bugDoc.data()
//         } as Bug)
//       } else {
//         toast.error('Bug not found')
//         router.push('/bugs')
//       }
//     } catch (error) {
//       console.error('Error fetching bug:', error)
//       toast.error('Failed to load bug details')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Fetch answers for this bug
//   const fetchAnswers = async () => {
//     try {
//       setAnswersLoading(true)
//       const answersQuery = query(
//         collection(db, 'bugs', params.id, 'answers'),
//         orderBy('createdAt', 'desc')
//       )
      
//       const querySnapshot = await getDocs(answersQuery)
//       const fetchedAnswers = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })) as Answer[]
      
//       setAnswers(fetchedAnswers)
//     } catch (error) {
//       console.error('Error fetching answers:', error)
//     } finally {
//       setAnswersLoading(false)
//     }
//   }

//   // Submit new answer
//   const handleSubmitAnswer = async () => {
//     if (!user) {
//       toast.error('Please log in to submit an answer')
//       return
//     }

//     if (!newAnswer.trim()) {
//       toast.error('Please enter an answer')
//       return
//     }

//     try {
//       setSubmitting(true)
      
//       await addDoc(collection(db, 'bugs', params.id, 'answers'), {
//         content: newAnswer.trim(),
//         authorId: user.uid,
//         authorName: user.displayName || user.email || 'Anonymous',
//         createdAt: serverTimestamp(),
//         votes: 0,
//         isAccepted: false
//       })

//       toast.success('Answer submitted successfully!')
//       setNewAnswer('')
//       fetchAnswers() // Refresh answers
      
//     } catch (error) {
//       console.error('Error submitting answer:', error)
//       toast.error('Failed to submit answer')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   useEffect(() => {
   
//     if (params.id) {
//       fetchBug()
//       fetchAnswers()
//     }
//   }, [params.id])

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'open': return 'bg-red-100 text-red-800'
//       case 'answered': return 'bg-blue-100 text-blue-800'
//       case 'solved': return 'bg-green-100 text-green-800'
//       case 'closed': return 'bg-gray-100 text-gray-800'
//       default: return 'bg-gray-100 text-gray-800'
//     }
//   }

//   const formatTime = (timestamp: any) => {
//     if (!timestamp) return 'Just now'
//     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
//     return formatDistanceToNow(date, { addSuffix: true })
//   }

//   if (loading) {
//     return (
//       <div className="max-w-4xl mx-auto p-6 space-y-6">
//         <Skeleton className="h-8 w-32" />
//         <Card>
//           <CardHeader>
//             <Skeleton className="h-8 w-3/4" />
//             <div className="flex space-x-2">
//               <Skeleton className="h-6 w-16" />
//               <Skeleton className="h-6 w-16" />
//               <Skeleton className="h-6 w-16" />
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Skeleton className="h-32 w-full" />
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   if (!bug) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">Bug not found</h3>
//             <p className="text-gray-500 mb-4">The bug you're looking for doesn't exist.</p>
//             <Button onClick={() => router.push('/bugs')}>
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Feed
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       {/* Back Button */}
//       <Button 
//         variant="ghost" 
//         onClick={() => router.push('/bugs')}
//         className="mb-4"
//       >
//         <ArrowLeft className="w-4 h-4 mr-2" />
//         Back to Feed
//       </Button>

//       {/* Bug Details */}
//       <Card>
//         <CardHeader>
//           <div className="flex justify-between items-start">
//             <CardTitle className="text-2xl font-bold pr-4">
//               {bug.title}
//             </CardTitle>
//             <Badge className={getStatusColor(bug.status)}>
//               {bug.status}
//             </Badge>
//           </div>
          
//           {/* Tags */}
//           <div className="flex flex-wrap gap-2">
//             {bug.tags.map(tag => (
//               <Badge key={tag} variant="secondary">
//                 {tag}
//               </Badge>
//             ))}
//           </div>
//         </CardHeader>
        
//         <CardContent className="space-y-4">
//           {/* Description */}
//           <div className="prose max-w-none">
//             <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
//               {bug.description}
//             </p>
//           </div>
          
//           {/* Meta Info */}
//           <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-1">
//                 <User className="w-4 h-4" />
//                 <span>{bug.createdBy}</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Clock className="w-4 h-4" />
//                 <span>{formatTime(bug.createdAt)}</span>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-1">
//                 <VoteButton 
//                         targetId = {bug.id}
//                         targetType = "bug"
//                         parentId = {bug.id}
//                         initialVotes = {bug.votes || 0}
//                         onVoteUpdate = {(vote)=>vote+1}
                       
//                  />
//               </div>
//               <div className="flex items-center space-x-1">
//                 <MessageCircle className="w-4 h-4" />
//                 <span>{answers.length}</span>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
    
//             <AiSuggestionSection title = {bug.title} description={bug.description} />
//       {/* Add Answer Section */}
//       {user && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Submit an Answer</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <Textarea
//               placeholder="Share your solution or helpful insights..."
//               value={newAnswer}
//               onChange={(e) => setNewAnswer(e.target.value)}
//               rows={4}
//               className="resize-none"
//             />
//             <div className="flex justify-end">
//               <Button 
//                 onClick={handleSubmitAnswer}
//                 disabled={submitting || !newAnswer.trim()}
//               >
//                 {submitting ? (
//                   'Submitting...'
//                 ) : (
//                   <>
//                     <Send className="w-4 h-4 mr-2" />
//                     Submit Answer
//                   </>
//                 )}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Login Prompt for Non-authenticated Users */}
//       {!user && (
//         <Card>
//           <CardContent className="text-center py-8">
//             <p className="text-gray-600 mb-4">Want to help solve this bug?</p>
//             <Button onClick={() => router.push('/login')}>
//               Log in to Submit Answer
//             </Button>
//           </CardContent>
//         </Card>
//       )}

//       {/* Answers Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center space-x-2">
//             <MessageCircle className="w-5 h-5" />
//             <span>Answers ({answers.length})</span>
//           </CardTitle>
//         </CardHeader>
        
//         <CardContent>
//           {answersLoading ? (
//             <div className="space-y-4">
//               {[1, 2, 3].map(i => (
//                 <div key={i} className="space-y-2">
//                   <Skeleton className="h-4 w-32" />
//                   <Skeleton className="h-20 w-full" />
//                   <Separator />
//                 </div>
//               ))}
//             </div>
//           ) : answers.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//               <p>No answers yet. Be the first to help!</p>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {answers.map((answer, index) => (
//                 <div key={answer.id}>
//                   <div className="space-y-3">
//                     {/* Answer Header */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2 text-sm text-gray-500">
//                         <User className="w-4 h-4" />
//                         <span>{answer.authorName || 'Anonymous'}</span>
//                         <span>•</span>
//                         <Clock className="w-4 h-4" />
//                         <span>{formatTime(answer.createdAt)}</span>
//                       </div>
                      
//                       <div className="flex items-center space-x-2">
//                         {/* <Button variant="ghost" size="sm">
//                           <ThumbsUp className="w-4 h-4 mr-1" />
//                            {answer.votes || 0}
//                           <ThumbsDown className="w-4 h-4 mr-1" />
                          
//                         </Button> */}
//                         <VoteButton 
//                         targetId = {answer.id}
//                         targetType = "answer"
//                         parentId = {bug.id}
//                         initialVotes = {answer.votes || 0}
//                         onVoteUpdate = {(vote)=>vote+1}
                       
//                         />
//                       </div>
//                     </div>
                    
//                     {/* Answer Content */}
//                     <div className="prose max-w-none">
//                       <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
//                         {answer.content}
//                       </p>
//                     </div>
//                   </div>
                  
//                   {/* Separator (except for last answer) */}
//                   {index < answers.length - 1 && <Separator className="mt-6" />}
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }




