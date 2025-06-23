// your responce profile page

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Mail, 
  MapPin, 
  MessageCircle, 
  ThumbsUp, 
  Bug, 
  Edit3, 
  Code,
  Trophy,
  Calendar,
  Star,
  Target,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import EditProfileModal from '@/components/features/EditProfileModal'


interface UserProfile {
  uid: string
  username: string
  email: string
  profilePic?: string
  about?: string
  techStack: string[]
  location?: string
  totalAnswers: number
  totalUpvotes: number
  bugsReported: number
  joinedAt: any
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile
        
        // Calculate fresh stats
        const stats = await calculateUserStats()
        const updatedProfile = { ...userData, ...stats }
        
        setProfile(updatedProfile)
      } else {
        toast.success("New to BroSolve? Let's set up your profile!")
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // Calculate user statistics from Firestore
  const calculateUserStats = async (): Promise<{
    totalAnswers: number
    totalUpvotes: number
    bugsReported: number
  }> => {
    if (!user) return { totalAnswers: 0, totalUpvotes: 0, bugsReported: 0 }

    try {
      // Count bugs reported by user
      const bugsQuery = query(
        collection(db, 'bugs'),
        where('createdBy', '==', user.uid)
      )
      const bugsSnapshot = await getDocs(bugsQuery)
      const bugsReported = bugsSnapshot.size

      // Count answers by user across all bugs
      const bugsAllSnapshot = await getDocs(collection(db, 'bugs'))
      let totalAnswers = 0
      let totalUpvotes = 0
        
      for (const bugDoc of bugsAllSnapshot.docs) {
        const answersQuery = query(
          collection(db, 'bugs', bugDoc.id, 'answers'),
          where('authorId', '==', user.uid)
        )
        const answersSnapshot = await getDocs(answersQuery)
        
        totalAnswers += answersSnapshot.size
        
        // Sum up votes for user's answers
        answersSnapshot.docs.forEach(answerDoc => {
          const votes = answerDoc.data().votes || 0
          totalUpvotes += votes
        })
      }
       
      return { totalAnswers, totalUpvotes, bugsReported }
    } catch (error) {
      console.error('Error calculating stats:', error)
      return { totalAnswers: 0, totalUpvotes: 0, bugsReported: 0 }
    }
  }

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
    setShowEditModal(false)
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      router.push('/login')
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="p-8">
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                <Skeleton className="h-32 w-32 rounded-2xl" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getReputationLevel = (upvotes: number) => {
    if (upvotes >= 1000) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' }
    if (upvotes >= 500) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (upvotes >= 100) return { level: 'Intermediate', color: 'text-green-600', bg: 'bg-green-100' }
    if (upvotes >= 25) return { level: 'Beginner', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Newcomer', color: 'text-gray-600', bg: 'bg-gray-100' }
  }

  const reputation = getReputationLevel(profile.totalUpvotes)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Developer Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your BroSolve community presence</p>
          </div>
          <Button 
            onClick={() => setShowEditModal(true)} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Edit3 className="w-5 h-5 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Main Profile Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="p-8">
            <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <Avatar className="relative h-32 w-32 rounded-2xl shadow-lg">
                  <AvatarImage 
                    src={profile.profilePic} 
                    alt={profile.username}
                    className="rounded-2xl"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700 rounded-2xl">
                    {getInitials(profile.username || profile.email)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-gray-900">{profile.username}</h2>
                    <Badge className={`${reputation.bg} ${reputation.color} border-0 px-3 py-1 font-semibold`}>
                      <Star className="w-4 h-4 mr-1" />
                      {reputation.level}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDistanceToNow(profile.joinedAt?.toDate?.() || new Date(), { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  {profile.about && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-l-4 border-blue-300">
                      <p className="text-gray-700 leading-relaxed">{profile.about}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Tech Stack Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Tech Stack</h3>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {profile.techStack.length > 0 ? (
                  profile.techStack.map(tech => (
                    <Badge 
                      key={tech} 
                      className="bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 px-3 py-1.5 font-medium"
                    >
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="italic">No technologies added yet</p>
                    <p className="text-sm mt-1">Edit your profile to showcase your skills</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Statistics */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Community Impact</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                      <span className="text-3xl font-bold text-blue-600">
                        {profile.totalAnswers}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800">Solutions Provided</h4>
                    <p className="text-sm text-gray-600 mt-1">Helping fellow developers</p>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <ThumbsUp className="w-8 h-8 text-green-600" />
                      <span className="text-3xl font-bold text-green-600">
                        {profile.totalUpvotes}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800">Community Appreciation</h4>
                    <p className="text-sm text-gray-600 mt-1">Upvotes received</p>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <Bug className="w-8 h-8 text-red-600" />
                      <span className="text-3xl font-bold text-red-600">
                        {profile.bugsReported}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800">Issues Reported</h4>
                    <p className="text-sm text-gray-600 mt-1">Contributing to the platform</p>
                  </div>
                </div>
              </div>

              {/* Achievement Badge */}
              {profile.totalUpvotes > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Community Contributor</h4>
                      <p className="text-sm text-gray-600">
                        Thank you for making BroSolve a better place for developers!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  )
}

