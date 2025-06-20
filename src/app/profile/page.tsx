'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  MapPin, 
  MessageCircle, 
  ThumbsUp, 
  Bug, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Code,
  Trophy,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

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

const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'MongoDB', 
  'Firebase', 'PostgreSQL', 'Python', 'Django', 'FastAPI', 'Express.js',
  'Vue.js', 'Angular', 'Tailwind CSS', 'CSS', 'HTML', 'Git', 'Docker',
  'AWS', 'Vercel', 'Netlify', 'GraphQL', 'REST API', 'MySQL', 'Redis',
  'Java', 'Spring Boot', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust'
]

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Edit form states
  const [editUsername, setEditUsername] = useState('')
  const [editAbout, setEditAbout] = useState('')
  const [editTechStack, setEditTechStack] = useState<string[]>([])
  const [editLocation, setEditLocation] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile
        setProfile(userData)
        
        // Set edit form values
        setEditUsername(userData.username || '')
        setEditAbout(userData.about || '')
        setEditTechStack(userData.techStack || [])
        setEditLocation(userData.location || '')
      } else {
        // No profile exists, redirect to onboarding
         toast.success("New to BroSolve let's start with profile setup");
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

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    const imageRef = ref(storage, `profile-pictures/${user.uid}`)
    await uploadBytes(imageRef, file)
    return await getDownloadURL(imageRef)
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user || !profile) return

    try {
      setSaving(true)
      
      let profilePicUrl = profile.profilePic

      // Upload new image if selected
      if (selectedImage) {
        setUploadingImage(true)
        profilePicUrl = await handleImageUpload(selectedImage)
        setUploadingImage(false)
      }

      // Get updated stats
      const stats = await calculateUserStats()

      const updatedProfile = {
        ...profile,
        username: editUsername.trim(),
        about: editAbout.trim(),
        techStack: editTechStack,
        location: editLocation.trim(),
        profilePic: profilePicUrl,
        ...stats
      }

      await updateDoc(doc(db, 'users', user.uid), updatedProfile)
      
      setProfile(updatedProfile)
      setEditing(false)
      setSelectedImage(null)
      toast.success('Profile updated successfully!')
      
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  // Handle tech stack toggle
  const toggleTechStack = (tech: string) => {
    setEditTechStack(prev => 
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      setSelectedImage(file)
    }
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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        {!editing && (
          <Button onClick={() => setEditing(true)} variant="outline">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={selectedImage ? URL.createObjectURL(selectedImage) : profile.profilePic} 
                  alt={profile.username}
                />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.username || profile.email)}
                </AvatarFallback>
              </Avatar>
              
              {editing && (
                <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="Enter username"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">About</label>
                    <Textarea
                      value={editAbout}
                      onChange={(e) => setEditAbout(e.target.value)}
                      placeholder="Tell us about yourself (max 160 characters)"
                      maxLength={160}
                      className="mt-1 resize-none"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editAbout.length}/160 characters
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Location (Optional)</label>
                    <Input
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="City, State"
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{profile.username}</h2>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDistanceToNow(profile.joinedAt?.toDate?.() || new Date(), { addSuffix: true })}</span>
                    </div>
                  </div>
                  {profile.about && (
                    <p className="text-gray-700 mt-2">{profile.about}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Tech Stack Section */}
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Code className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Tech Stack</h3>
            </div>
            
            {editing ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Select your technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {TECH_STACK_OPTIONS.map(tech => (
                    <Badge
                      key={tech}
                      variant={editTechStack.includes(tech) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTechStack(tech)}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.techStack.length > 0 ? (
                  profile.techStack.map(tech => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No tech stack specified</p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Statistics */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Statistics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">
                    {profile.totalAnswers}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Answers Submitted</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {profile.totalUpvotes}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Upvotes Received</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Bug className="w-5 h-5 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">
                    {profile.bugsReported}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Bugs Reported</p>
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {editing && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false)
                  setSelectedImage(null)
                  // Reset form values
                  setEditUsername(profile.username || '')
                  setEditAbout(profile.about || '')
                  setEditTechStack(profile.techStack || [])
                  setEditLocation(profile.location || '')
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={saving || uploadingImage || !editUsername.trim()}
              >
                {saving || uploadingImage ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}