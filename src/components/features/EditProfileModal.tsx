'use client'

import { useState } from 'react'
import { doc, Timestamp, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Save, 
  X, 
  Camera,
  Code,
  Loader2,
  User,
  MapPin,
  FileText,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

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
  joinedAt: Timestamp
}

interface EditProfileModalProps {
  profile: UserProfile
  onClose: () => void
  onSave: (updatedProfile: UserProfile) => void
}

const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'MongoDB', 
  'Firebase', 'PostgreSQL', 'Python', 'Django', 'FastAPI', 'Express.js',
  'Vue.js', 'Angular', 'Tailwind CSS', 'CSS', 'HTML', 'Git', 'Docker',
  'AWS', 'Vercel', 'Netlify', 'GraphQL', 'REST API', 'MySQL', 'Redis',
  'Java', 'Spring Boot', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust'
]

export default function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Edit form states
  const [editUsername, setEditUsername] = useState(profile.username || '')
  const [editAbout, setEditAbout] = useState(profile.about || '')
  const [editTechStack, setEditTechStack] = useState<string[]>(profile.techStack || [])
  const [editLocation, setEditLocation] = useState(profile.location || '')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(profile.profilePic || '')

  // Handle image upload to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    const formData = new FormData()

    formData.append('file', file)

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const result = await response.json()
    return result.url
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user || !profile) return

    // Validation
    if (!editUsername.trim()) {
      toast.error('Username is required')
      return
    }
  
    try {
      setSaving(true)
      
      let profilePicUrl = profile.profilePic

      // Upload new image if selected
      if (selectedImage) {
        setUploadingImage(true)
        try {
          profilePicUrl = await uploadToCloudinary(selectedImage)
        } catch (error) {
          console.error('Image upload failed:', error)
          toast.error('Failed to upload image. Please try again.')
          return
        } finally {
          setUploadingImage(false)
        }
      }

      const updatedProfile = {
        ...profile,
        username: editUsername.trim(),
        about: editAbout.trim(),
        techStack: editTechStack,
        location: editLocation.trim(),
        profilePic: profilePicUrl,
      }

      await updateDoc(doc(db, 'users', user.uid), updatedProfile)
      
      onSave(updatedProfile)
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
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle modal close
  const handleClose = () => {
    if (saving || uploadingImage) {
      toast.error('Please wait while we save your changes')
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 text-white rounded-t-2xl p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <p className="text-slate-200 text-sm mt-1">Update your BroSolve profile information</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={saving || uploadingImage}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-400 to-slate-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <Avatar className="relative h-32 w-32 rounded-2xl shadow-lg">
                  <AvatarImage 
                    src={previewUrl} 
                    alt={profile.username}
                    className="rounded-2xl object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 rounded-2xl">
                    {getInitials(editUsername || profile.email)}
                  </AvatarFallback>
                </Avatar>
                
                <label className="absolute -bottom-2 -right-2 bg-blue-600     hover:bg-blue-800 text-white rounded-full p-3 cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={uploadingImage || saving}
                  />
                </label>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium">Profile Picture</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click the camera icon to upload a new image
                </p>
                <p className="text-xs text-gray-400">
                  Maximum size: 5MB • Supported: JPG, PNG, GIF
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
                <User className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Username <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="border-2 border-gray-200 focus:border-slate-500 rounded-xl transition-all duration-200 h-12"
                    disabled={saving}
                  />
                  {editUsername && editUsername.length < 3 && (
                    <p className="text-xs text-red-500">Username must be at least 3 characters</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                  </label>
                  <Input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="City, State/Country"
                    className="border-2 border-gray-200 focus:border-slate-500 rounded-xl transition-all duration-200 h-12"
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  About Me
                </label>
                <Textarea
                  value={editAbout}
                  onChange={(e) => setEditAbout(e.target.value)}
                  placeholder="Tell the community about yourself, your coding journey, or areas of expertise..."
                  maxLength={160}
                  className="resize-none border-2 border-gray-200 focus:border-slate-500 rounded-xl transition-all duration-200 min-h-[100px]"
                  disabled={saving}
                  rows={4}
                />
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    Share your interests, experience, or what you&apos;re passionate about
                  </span>
                  <span className={`${editAbout.length > 150 ? 'text-red-500' : 'text-gray-500'}`}>
                    {editAbout.length}/160
                  </span>
                </div>
              </div>
            </div>

            {/* Tech Stack Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
                <Code className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-gray-800">Tech Stack</h3>
                <Badge className="bg-slate-100 text-blue-600 text-xs">
                  {editTechStack.length} selected
                </Badge>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select the technologies you work with. This helps other developers understand your expertise.
                </p>
                <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50/50 rounded-xl border-2 border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {TECH_STACK_OPTIONS.map(tech => (
                      <Badge
                        key={tech}
                        variant={editTechStack.includes(tech) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          editTechStack.includes(tech)
                            ? 'bg-blue-600 hover:bg-slate-800 text-white border-0 shadow-md hover:shadow-lg'
                            : 'border-2 border-gray-300 hover:border-slate-400 hover:bg-slate-50 text-gray-700'
                        } ${saving ? 'pointer-events-none opacity-50' : ''}`}
                        onClick={() => !saving && toggleTechStack(tech)}
                      >
                        {editTechStack.includes(tech) && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                {editTechStack.length === 0 && (
                  <p className="text-xs text-gray-500 italic">
                    No technologies selected. Choose your tech stack to help others understand your expertise.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0 rounded-b-2xl">
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={saving || uploadingImage}
              className="px-6 py-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={saving || uploadingImage || !editUsername.trim() || editUsername.length < 3}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {saving || uploadingImage ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {uploadingImage ? 'Uploading Image...' : 'Saving Profile...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}