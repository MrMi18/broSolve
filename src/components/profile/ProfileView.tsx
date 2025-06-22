import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Code,
  Trophy,
  Calendar,
  Sparkles
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'



interface ProfileViewProps {
  profile: UserProfile
  setEditing: (editing: boolean) => void
}

export default function ProfileView({ profile, setEditing }: ProfileViewProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getReputation = () => {
    const score = (profile.totalUpvotes * 10) + (profile.totalAnswers * 5) + (profile.bugsReported * 2)
    if (score >= 1000) return { level: 'Expert', color: 'from-purple-500 to-pink-500', icon: '👑' }
    if (score >= 500) return { level: 'Advanced', color: 'from-blue-500 to-purple-500', icon: '⭐' }
    if (score >= 100) return { level: 'Intermediate', color: 'from-green-500 to-blue-500', icon: '🚀' }
    return { level: 'Beginner', color: 'from-gray-500 to-gray-600', icon: '🌱' }
  }

  const reputation = getReputation()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your BroSolve presence</p>
        </div>
        <Button 
          onClick={() => setEditing(true)} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Edit3 className="w-5 h-5 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <Avatar className="relative h-24 w-24 ring-4 ring-white shadow-lg">
                <AvatarImage 
                  src={profile.profilePic} 
                  alt={profile.username}
                  className="object-cover"
                />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600">
                  {getInitials(profile.username || profile.email)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <h2 className="text-2xl font-bold text-gray-900">{profile.username}</h2>
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r ${reputation.color} text-white text-sm font-medium shadow-md`}>
                  <span>{reputation.icon}</span>
                  <span>{reputation.level}</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">
                    Joined {formatDistanceToNow(profile.joinedAt?.toDate?.() || new Date(), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              {profile.about && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-gray-700 leading-relaxed">{profile.about}</p>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tech Stack Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Tech Stack</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile.techStack.length > 0 ? (
                profile.techStack.map(tech => (
                  <Badge 
                    key={tech} 
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all duration-200 font-medium px-3 py-1"
                  >
                    {tech}
                  </Badge>
                ))
              ) : (
                <div className="flex items-center space-x-2 text-gray-500 italic bg-gray-50 p-4 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                  <span>No tech stack specified yet</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* Statistics */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Community Impact</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative text-center p-6 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-blue-600">
                      {profile.totalAnswers}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Answers Submitted</p>
                  <p className="text-xs text-gray-500 mt-1">Help provided to community</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative text-center p-6 bg-green-50/50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                      <ThumbsUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-green-600">
                      {profile.totalUpvotes}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Upvotes Received</p>
                  <p className="text-xs text-gray-500 mt-1">Community appreciation</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative text-center p-6 bg-red-50/50 rounded-xl border border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                      <Bug className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-red-600">
                      {profile.bugsReported}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Bugs Reported</p>
                  <p className="text-xs text-gray-500 mt-1">Issues shared with community</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}