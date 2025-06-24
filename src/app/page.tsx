"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/shared/navbar"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Bug, 
  Zap, 
  Users, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  Code, 
  MessageSquare,
  TrendingUp,
  Sparkles,
  Github,
  Coffee,
  Heart,
  Shield,
  Clock,
  Award
} from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [statsCount, setStatsCount] = useState({ bugs: 0, developers: 0, solutions: 0 })

  useEffect(() => {
    setIsVisible(true)
    
    // Animated counter for stats
    const animateStats = () => {
      let bugs = 0, developers = 0, solutions = 0
      const interval = setInterval(() => {
        if (bugs < 1247) bugs += 23
        if (developers < 892) developers += 17
        if (solutions < 1089) solutions += 19
        
        setStatsCount({ bugs, developers, solutions })
        
        if (bugs >= 1247 && developers >= 892 && solutions >= 1089) {
          clearInterval(interval)
          setStatsCount({ bugs: 1247, developers: 892, solutions: 1089 })
        }
      }, 50)
    }
    
    setTimeout(animateStats, 1000)
  }, [])

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Solutions",
      description: "Get instant intelligent suggestions powered by cutting-edge AI technology"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with thousands of developers ready to help solve your toughest bugs"
    },
    {
      icon: Shield,
      title: "Verified Solutions",
      description: "Quality-checked answers from experienced developers in our community"
    }
  ]

  const stats = [
    { number: statsCount.bugs, label: "Bugs Resolved", icon: Bug },
    { number: statsCount.developers, label: "Active Developers", icon: Users },
    { number: statsCount.solutions, label: "Solutions Shared", icon: CheckCircle }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-pink-200/30 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Hero Badge */}
            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-6 py-3 text-sm font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Bug Resolution Platform
            </Badge>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Debug Faster with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BroSolve
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Stuck on a bug? 🐛 Post it and get instant AI suggestions plus help from our vibrant developer community.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg"
                onClick={() => router.push('/bugs/submit')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <Bug className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Submit Your Bug
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/bugs')}
                className="border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Browse Solutions
                <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card 
                    key={index} 
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-2xl p-6"
                  >
                    <CardContent className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {stat.number.toLocaleString()}+
                      </div>
                      <div className="text-gray-600 font-medium">{stat.label}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 rounded-xl font-semibold">
              <Target className="w-4 h-4 mr-2" />
              Why Choose BroSolve
            </Badge>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Solve Bugs Faster Than Ever
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Combine the power of AI with community expertise for lightning-fast bug resolution
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index} 
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-2xl p-6 group"
                >
                  <CardContent className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recently Solved Section */}
      <section className="py-20">
        <div className={`max-w-6xl mx-auto px-4 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 px-4 py-2 rounded-xl font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔥 Recently Solved Bugs
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              See how our community tackles complex problems together
            </p>
          </div>
          
        
          
          <div className="text-center">
            <Button 
              onClick={() => router.push('/bugs')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              View All Solutions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 rounded-xl font-semibold">
              <Code className="w-4 h-4 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Get Solutions in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl p-6 text-center group">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Post Your Bug</h3>
                <p className="text-gray-600">Describe your issue with code snippets and error details</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl p-6 text-center group">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Get AI Suggestions</h3>
                <p className="text-gray-600">Receive instant AI-powered analysis and potential solutions</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl p-6 text-center group">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Community Help</h3>
                <p className="text-gray-600">Get additional insights from experienced developers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-xl rounded-2xl p-8 md:p-12 text-white">
            <CardContent className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Squash Some Bugs?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join thousands of developers who've already solved their toughest coding challenges with BroSolve
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg"
                  onClick={() => router.push('/bugs/submit')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Bug className="w-5 h-5 mr-2" />
                  Submit Your First Bug
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/bugs')}
                  className="border-2 border-white text-blue-700 hover:bg-white hover:text-purple-700 font-semibold px-8 py-4 rounded-xl transition-all duration-300"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join the Community
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}


