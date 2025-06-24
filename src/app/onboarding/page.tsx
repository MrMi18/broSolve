'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Camera,
  Code,
  MapPin,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'MongoDB', 
  'Firebase', 'PostgreSQL', 'Python', 'Django', 'FastAPI', 'Express.js',
  'Vue.js', 'Angular', 'Tailwind CSS', 'CSS', 'HTML', 'Git', 'Docker',
  'AWS', 'Vercel', 'Netlify', 'GraphQL', 'REST API', 'MySQL', 'Redis',
  'Java', 'Spring Boot', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust'
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Form states
  const [username, setUsername] = useState('')
  const [about, setAbout] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  // Handle image upload
  const handleImageUpload = async (file: File | null) => {
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();
    
    if (!token) throw new Error('Failed to get authentication token');

    const formData = new FormData();
    if(file){
       formData.append('file', file );
    }
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const { url } = await response.json();
    return url;
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // Handle tech stack toggle
  const toggleTechStack = (tech: string) => {
    setTechStack(prev => 
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  // Submit profile
  const handleSubmit = async () => {
    if (!user) {
      toast.error('User not authenticated')
      router.push("/login") 
      return
    }

    if (!username.trim()) {
      toast.error('Username is required')
      return
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters long')
      return
    }

    try {
      setLoading(true)
      
      let profilePicUrl = ''

      // Upload profile picture if selected
      if (selectedImage) {
        setUploadingImage(true)
        profilePicUrl = await handleImageUpload(selectedImage)
        setUploadingImage(false)
      }

      // Create user profile
      const userProfile = {
        uid: user.uid,
        username: username.trim(),
        email: user.email || '',
        profilePic: profilePicUrl,
        about: about.trim(),
        techStack: techStack,
        location: location.trim(),
        totalAnswers: 0,
        totalUpvotes: 0,
        bugsReported: 0,
        joinedAt: serverTimestamp()
      }

      await setDoc(doc(db, 'users', user.uid), userProfile)
      
      toast.success('Profile created successfully!')
      router.push('/profile')
      
    } catch (error) {
      console.error('Error creating profile:', error)
      toast.error('Failed to create profile')
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to BroSolve! 🚀
          </h1>
          <p className="text-gray-600">
            Let&apos;s set up your profile to get you started
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
            }`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
            }`}>
              {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 3 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
            }`}>
              3
            </div>
          </div>
        </div>

        <Card className="shadow-xl">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={previewUrl} alt="Profile" />
                      <AvatarFallback className="text-lg">
                        {getInitials(username || user.email || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload a profile picture (optional)
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Username *
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="text-center"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is how other developers will see you
                  </p>
                </div>

                {/* About */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    About (Optional)
                  </label>
                  <Textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Tell us about yourself... (e.g., 'Frontend developer passionate about React')"
                    maxLength={160}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {about.length}/160 characters
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!username.trim() || username.length < 3}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Tech Stack */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Tech Stack</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Select the technologies you work with:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TECH_STACK_OPTIONS.map(tech => (
                      <Badge
                        key={tech}
                        variant={techStack.includes(tech) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => toggleTechStack(tech)}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {techStack.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">
                      Selected: {techStack.length} technologies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {techStack.map(tech => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Location & Finish */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Almost Done!</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Location (Optional)
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State (e.g., San Francisco, CA)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Help others know where you&apos;re based
                  </p>
                </div>

                {/* Profile Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Profile Summary:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span><strong>Username:</strong> {username}</span>
                    </div>
                    {about && (
                      <div className="flex items-start space-x-2">
                        <User className="w-4 h-4 text-gray-500 mt-0.5" />
                        <span><strong>About:</strong> {about}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-gray-500" />
                      <span><strong>Tech Stack:</strong> {techStack.length} technologies selected</span>
                    </div>
                    {location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span><strong>Location:</strong> {location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading || uploadingImage}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading || uploadingImage ? (
                      'Creating Profile...'
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Join thousands of developers solving bugs together!</p>
        </div>
      </div>
    </div>
  )
}