import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  User,
  MapPin,
  FileText,
  Loader2,
  Upload,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { UserProfile } from './ProfilePage'

interface ProfileEditProps {
  profile: UserProfile
  setProfile: (profile: UserProfile) => void
  setEditing: (editing: boolean) => void
  onStatsUpdate: () => Promise<{
    totalAnswers: number
    totalUpvotes: number
    bugsReported: number
  }>
}

const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'MongoDB', 
  'Firebase', 'PostgreSQL', 'Python', 'Django', 'FastAPI', 'Express.js',
  'Vue.js', 'Angular', 'Tailwind CSS', 'CSS', 'HTML', 'Git', 'Docker',
  'AWS', 'Vercel', 'Netlify', 'GraphQL', 'REST API', 'MySQL', 'Redis',
  'Java', 'Spring Boot', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust'
]

export default function ProfileEdit({ profile, setProfile, setEditing, onStatsUpdate }: ProfileEditProps) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Edit form states
  const [editUsername, setEditUsername] = useState(profile.username || '')
  const [editAbout, setEditAbout] = useState(profile.about || '')
  const [editTechStack, setEditTechStack] = useState<string[]>(profile.techStack || [])
  const [editLocation, setEditLocation] = useState(profile.location || '')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Upload failed')
    }

    const data = await response.json()
    return data.url
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user || !profile) return

    // Validation
    if (!editUsername.trim()) {
      toast.error('Username is required')
      return
    }

    if (editAbout.length > 160) {
      toast.error('About section must be 160 characters or less')
      return
    }
  
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
      const stats = await onStatsUpdate()

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
      setPreviewUrl(null)
      toast.success('Profile updated successfully!')
      
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error.message || 'Failed to save profile')
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
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setSelectedImage(null)
    setPreviewUrl(null)
    setEditUsername(profile.username || '')
    setEditAbout(profile.about || '')
    setEditTechStack(profile.techStack || [])
    setEditLocation(profile.location || '')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Profile
          </h1>
          <p className="text-gray-600 mt-2">Update your BroSolve information</p>
        </div>
      </div>

      {/* Edit Profile Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25"></div>
              <Avatar className="relative h-24 w-24 ring-4 ring-white shadow-lg">
                <AvatarImage 
                  src={previewUrl || profile.profilePic} 
                  alt={profile.username}
                  className="object-cover"
                />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600">
                  {getInitials(editUsername || profile.email)}
                </AvatarFallback>
              </Avatar>
              
              <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2 cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110 shadow-lg">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">Profile Picture</h3>
              <p className="text-sm text-gray-600 mb-3">
                Upload a professional photo. Max size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
              {selectedImage && (
                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <Check className="w-4 h-4" />
                  <span>New image selected: {selectedImage.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>About</span>
            </label>
            <Textarea
              value={editAbout}
              onChange={(e) => setEditAbout(e.target.value)}
              placeholder="Tell the community about yourself, your experience, or what you're passionate about..."
              maxLength={160}
              className="border-2 border-gray-200 focus:border-blue-400 focus:ring-0 transition-colors duration-200 resize-none min-h-[100px]"
              rows={4}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {editAbout.length}/160 characters
              </p>
              {editAbout.length > 150 && (
                <p className="text-xs text-orange-500 font-medium">
                  {160 - editAbout.length} characters remaining
                </p>
              )}
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Tech Stack</h3>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600 mb-3">
                Select the technologies you work with. This helps the community understand your expertise.
              </p>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK_OPTIONS.map(tech => (
                  <Badge
                    key={tech}
                    variant={editTechStack.includes(tech) ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                      editTechStack.includes(tech)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg'
                        : 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => toggleTechStack(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
              {editTechStack.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm font-medium text-gray-700">
                    Selected ({editTechStack.length}): {editTechStack.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold px-6 py-2 transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={saving || uploadingImage || !editUsername.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {saving || uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadingImage ? 'Uploading Image...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}{/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Username *</span>
              </label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter your username"
                className="border-2 border-gray-200 focus:border-blue-400 focus:ring-0 transition-colors duration-200"
                maxLength={30}
              />
              <p className="text-xs text-gray-500">{editUsername.length}/30 characters</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>Location</span>
              </label>
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="City, State"
                className="border-2 border-gray-200 focus:border-blue-400 focus:ring-0 transition-colors duration-200"
              />
            </div>
          </div>