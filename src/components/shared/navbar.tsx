
"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, 
  Code2, 
  Bug, 
  PlusCircle, 
  User, 
  LogOut, 
  Settings,
  Home,
  Info
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [Loading, setLoading] = useState(false)
  const [userName, setUsername] = useState()

  const fetchProfile = async () => {
    if (!user) return
    try {
      setLoading(true)
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        
        setImage(userData.profilePic)
        setUsername(userData.username || '')
      } 
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error) 
    }
  }

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/bugs', label: 'Feed', icon: Bug },
    { href: '/bugs/submit', label: 'Submit Bug', icon: PlusCircle },
    { href: '/about', label: 'About Us', icon: Info }
  ]

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full hover:scale-105 transition-all duration-300 hover:shadow-md"
        >
          <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-blue-200 transition-all duration-300">
            <AvatarImage src={image || ''} alt={userName || 'User'} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 
               user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl p-2" 
        align="end" 
        forceMount
      >
        <div className="flex items-center justify-start gap-3 p-3 rounded-lg bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
          <Avatar className="h-10 w-10">
            <AvatarImage src={image || ''} alt={userName || 'User'} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 
               user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-semibold text-gray-900">{userName || 'Anonymous'}</p>
            <p className="w-[180px] truncate text-sm text-gray-500">
              {user?.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem asChild>
          <Link 
            href="/profile" 
            className="cursor-pointer rounded-lg hover:bg-blue-50 transition-all duration-300 p-2 group"
          >
            <User className="mr-3 h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="font-medium text-gray-700 group-hover:text-blue-600">Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            href="/settings" 
            className="cursor-pointer rounded-lg hover:bg-blue-50 transition-all duration-300 p-2 group"
          >
            <Settings className="mr-3 h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="font-medium text-gray-700 group-hover:text-blue-600">Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem 
          className="cursor-pointer rounded-lg hover:bg-red-50 transition-all duration-300 p-2 group" 
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4 text-red-600 group-hover:text-red-700 transition-colors" />
          <span className="font-medium text-red-600 group-hover:text-red-700">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const MobileNav = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden hover:bg-blue-50 hover:scale-105 transition-all duration-300 rounded-lg"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[300px] sm:w-[400px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 border-0"
      >
        <div className="flex flex-col space-y-6 mt-4">
          <Link 
            href="/" 
            className="flex items-center space-x-3 text-xl font-bold group"
            onClick={() => setIsOpen(false)}
          >
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 group-hover:shadow-lg transition-all duration-300">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BroSolve
            </span>
          </Link>
          
          <div className="flex flex-col space-y-2 mt-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 text-sm font-medium py-3 px-4 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-300 group"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                  <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {user ? (
            <div className="mt-auto pt-6 border-t border-white/50">
              <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-white/60 backdrop-blur-sm">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={image || ''} alt={userName || 'User'} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 
                     user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{userName || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-red-600 hover:text-red-700 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300 rounded-lg font-semibold"
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="mt-auto pt-6 border-t border-white/50 space-y-3">
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300"
          >
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 group-hover:shadow-lg transition-all duration-300">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              BroSolve
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 group"
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Side - Auth */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="hidden md:block">
                <UserMenu />
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button 
                  asChild 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
            
            {/* Mobile Menu */}
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  )
}