'use client'

import React, { use, useEffect, useState } from 'react'
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
import { ArrowLeft, User, Clock, MessageCircle, ThumbsUp, Send, ThumbsDown, Edit, Trash2, X, Check, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import VoteButton from '@/components/features/VoteButton'
import AiSuggestionSection from '@/components/features/AiSuggestionSection'
import BugLoading from '@/components/loaders/BugLoading'
import NoBugFound from '@/components/loaders/NoBugFound'

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

// interface BugDetailPageProps {
//   params: {
//     id: string
//   }
// }

export default function BugDetailPage({params}: {params: Promise<{ id: string }>}) {
  
  const router = useRouter()
  const { user } = useAuth()
  
  const {id} = React.use(params)
  const [bug, setBug] = useState<Bug | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [answersLoading, setAnswersLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newAnswer, setNewAnswer] = useState('')
  const [bugBy,setBugBy] = useState()
  const [answerBy,setAnswerBy] = useState();
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
      const bugDoc = await getDoc(doc(db, 'bugs', id))
      
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
        userDetails(bugData.createdBy,'bug')
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
        collection(db, 'bugs', id, 'answers'),
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
      const userName = await userDetails(user.uid,'answer');
     
      await addDoc(collection(db, 'bugs', id, 'answers'), {
        content: newAnswer.trim(),
        authorId: user.uid,
        authorName: userName || user.email || 'Anonymous',
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
      
      await updateDoc(doc(db, 'bugs', id, 'answers', answerId), {
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
      
      await deleteDoc(doc(db, 'bugs', id, 'answers', answerId))
      
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
    if (id) {
      fetchBug()
      fetchAnswers()
      
    }
  }, [id])

  const userDetails = async(id:string,action:string) =>{
      const userData = await getDoc(doc(db, 'users', id));
      if (userData.exists()) {
        const data = userData.data() 
        if(action==="bug"){
          setBugBy(data.username || data.email)
        }
        else return data.username || data.email;
      }
    }
    

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border border-red-200'
      case 'answered': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'solved': return 'bg-green-100 text-green-800 border border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  if (loading) {
    return <BugLoading/>
  }

  if (!bug) {
    return <NoBugFound/>
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/bugs')}
          className="mb-6 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Feed
        </Button>

        {/* Bug Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader className="p-6">
            <div className="flex justify-between items-start">
              {editingBug ? (
                <div className="flex-1 space-y-4 pr-4">
                  <Input
                    value={editBugTitle}
                    onChange={(e) => setEditBugTitle(e.target.value)}
                    placeholder="Bug title"
                    className="text-xl font-bold border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                  <Input
                    value={editBugTags}
                    onChange={(e) => setEditBugTags(e.target.value)}
                    placeholder="Tags (comma separated)"
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-900 pr-4">
                      {bug.title}
                    </CardTitle>
                    {canEditBug && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingBug(true)}
                          disabled={deleting === bug.id}
                          className="border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteBug}
                          disabled={deleting === bug.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 hover:border-red-300 transition-all duration-300 rounded-lg"
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
              
              <Badge className={`${getStatusColor(bug.status)} font-semibold px-3 py-1 ml-2 rounded-lg`}>
                {bug.status.charAt(0).toUpperCase() + bug.status.slice(1)}
              </Badge>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {bug.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-300 rounded-lg px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="p-6 pt-0 space-y-6">
            {/* Description */}
            {editingBug ? (
              <div className="space-y-4">
                <Textarea
                  value={editBugDescription}
                  onChange={(e) => setEditBugDescription(e.target.value)}
                  placeholder="Bug description"
                  rows={6}
                  className="resize-none border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleUpdateBug}
                    disabled={updating}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
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
                    className="border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-6 py-2 rounded-xl transition-all duration-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-lg">
                  {bug.description}
                </p>
              </div>
            )}
            
            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{bugBy||bug.createdBy}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span>{formatTime(bug.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <VoteButton 
                  targetId={bug.id}
                  targetType="bug"
                  parentId={bug.id}
                  initialVotes={bug.votes || 0}
                  onVoteUpdate={(vote) => vote + 1}
                />
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{answers.length} answers</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      
        <AiSuggestionSection title={bug.title} description={bug.description} />
        
        {/* Add Answer Section */}
        {user && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                <Send className="w-6 h-6 mr-3 text-blue-500" />
                Submit an Answer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <Textarea
                placeholder="Share your solution or helpful insights..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={5}
                className="resize-none border-2 border-gray-200 focus:border-blue-500 rounded-xl text-gray-700"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !newAnswer.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
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
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="text-center p-8">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Want to help solve this bug?</h3>
                <p className="text-gray-600">Join the BroSolve community and share your expertise</p>
                <Button 
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Log in to Submit Answer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answers Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-800">
              <MessageCircle className="w-6 h-6 text-green-500" />
              <span>Answers ({answers.length})</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 pt-0">
            {answersLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full rounded-xl" />
                    {i < 3 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            ) : answers.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">No answers yet</h3>
                  <p className="text-gray-500">Be the first to help solve this bug!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {answers.map((answer, index) => (
                  
                  <div key={answer.id}>
                    <div className="space-y-4">
                      {/* Answer Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="font-semibold text-gray-800">{answer.authorName || 'Anonymous'}</span>
                              {answer.isAccepted && (
                                <Badge className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded-lg">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accepted
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(answer.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
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
                                className="hover:bg-blue-50 transition-all duration-300 rounded-lg"
                              >
                                <Edit className="w-4 h-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAnswer(answer.id)}
                                disabled={deleting === answer.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 rounded-lg"
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
                        <div className="space-y-4 ml-14">
                          <Textarea
                            value={editAnswerContent}
                            onChange={(e) => setEditAnswerContent(e.target.value)}
                            rows={4}
                            className="resize-none border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                          />
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleUpdateAnswer(answer.id)}
                              disabled={updating}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
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
                              className="border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="ml-14 bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {answer.content}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Separator (except for last answer) */}
                    {index < answers.length - 1 && <Separator className="mt-8 bg-gray-200" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


