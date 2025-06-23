'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Code, 
  Bug,
  MessageCircle,
  Users,
  Lightbulb
} from 'lucide-react'

const ErrorPage = () => {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleGoHome = () => {
    setIsRedirecting(true)
    router.push('/')
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleSearch = () => {
    router.push('/search')
  }

  const quickLinks = [
    {
      icon: MessageCircle,
      title: 'Browse Questions',
      description: 'Find answers to coding problems',
      href: '/bugs',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with other developers',
      href: '/bugs',
      color: 'text-green-600'
    },
    {
      icon: Bug,
      title: 'Report Issues',
      description: 'Help improve the platform',
      href: '/bugs/submit',
      color: 'text-red-600'
    },
    {
      icon: Lightbulb,
      title: 'Ask Question',
      description: 'Get help from the community',
      href: '/feed',
      color: 'text-yellow-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Error Card */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="text-center py-16 px-8">
              {/* 404 Animation */}
              <div className="relative mb-8">
                <div className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  404
                </div>
                <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-slate-200 -z-10 translate-x-1 translate-y-1">
                  404
                </div>
              </div>

              {/* Error Message */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Oops! Page Not Found
                </h1>
                <p className="text-lg text-slate-600 mb-2">
                  The page you're looking for doesn't exist or has been moved.
                </p>
                <p className="text-sm text-slate-500">
                  Don't worry, even the best developers encounter 404s! 🚀
                </p>
              </div>

              {/* Auto Redirect Notice */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  {isRedirecting ? (
                    "Redirecting to home page..."
                  ) : (
                    <>
                      Automatically redirecting to home page in{' '}
                      <span className="font-bold text-blue-800">{countdown}</span> seconds
                    </>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Button
                  onClick={handleGoHome}
                  disabled={isRedirecting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go to Home
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  disabled={isRedirecting}
                  className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSearch}
                  disabled={isRedirecting}
                  className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all duration-200"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-700 text-center mb-6">
            Or explore these popular sections:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon
              return (
                <Card 
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/70 backdrop-blur-sm"
                  onClick={() => !isRedirecting && router.push(link.href)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 ${link.color} mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">
                      {link.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Brand Footer */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BroSolve
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Your coding community platform • Always here to help
          </p>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage