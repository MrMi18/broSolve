"use client"

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { MessageCircle, Plus, TrendingUp, Users, Bug } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import BugSkeleton from '@/components/features/BugSkeleton'
import { SearchAndFilters } from '@/components/features/SearchAndFilters'
import { BugCard } from '@/components/features/BugCard'
import Link from 'next/link'

interface Bug {
  id: string
  title: string
  description: string
  tags: string[]
  status: 'open' | 'answered' | 'solved' | 'closed'
  createdBy: string
  createdAt: any
  votes: number
  answerCount?: number
}

export default function FeedPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const BUGS_PER_PAGE = 10

  const fetchBugs = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      let q = query(
        collection(db, 'bugs'),
        orderBy('createdAt', 'desc'),
        limit(BUGS_PER_PAGE)
      )

      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, 'bugs'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(BUGS_PER_PAGE)
        )
      }

      const querySnapshot = await getDocs(q)
      const newBugs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bug[]

      if (isLoadMore) {
        setBugs(prev => [...prev, ...newBugs])
      } else {
        setBugs(newBugs)
      }

      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1])
      }

      setHasMore(querySnapshot.docs.length === BUGS_PER_PAGE)

    } catch (error) {
      console.error('Error fetching bugs:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchBugs()
  }, [])

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || bug.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(bugs.flatMap(bug => bug.tags)))

  // Stats calculation
  const stats = {
    total: bugs.length,
    open: bugs.filter(bug => bug.status === 'open').length,
    solved: bugs.filter(bug => bug.status === 'solved').length,
    contributors: Array.from(new Set(bugs.map(bug => bug.createdBy))).length
  }

  if (loading) {
    return <BugSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Bug className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            BroSolve Community
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Where developers help developers debug. Share your bugs, get solutions, and help others solve theirs.
          </p>
          
          {/* CTA Button */}
          <Link href="/bugs/submit">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Submit Your Bug
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Bugs</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.solved}</div>
              <div className="text-sm text-gray-500">Bugs Solved</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.contributors}</div>
              <div className="text-sm text-gray-500">Contributors</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchAndFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            allTags={allTags}
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm || selectedTag ? 'Search Results' : 'Latest Bugs'}
            </h2>
            <p className="text-gray-500 mt-1">
              {filteredBugs.length} {filteredBugs.length === 1 ? 'bug' : 'bugs'} found
            </p>
          </div>
        </div>

        {/* Bug Feed */}
        <div className="space-y-6">
          {filteredBugs.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-3">No bugs found</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  {searchTerm || selectedTag
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Be the first to contribute to our community by submitting a bug report!"
                  }
                </p>
                {!searchTerm && !selectedTag && (
                  <Link href="/bugs/submit">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit First Bug
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredBugs.map(bug => (
              <BugCard key={bug.id} bug={bug} />
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMore && !searchTerm && !selectedTag && filteredBugs.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => fetchBugs(true)}
              disabled={loadingMore}
              variant="outline"
              size="lg"
              className="px-8 py-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Loading more bugs...
                </>
              ) : (
                'Load More Bugs'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}








// //  Bugs page
// "use client"

// import { useEffect, useState } from 'react'
// import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData, onSnapshot } from 'firebase/firestore'
// import { db } from '@/lib/firebase'
// import { Button } from '@/components/ui/button'
// import { MessageCircle } from 'lucide-react'
// import { Card, CardContent } from '@/components/ui/card'
// import BugSkeleton from '@/components/features/BugSkeleton'
// import { SearchAndFilters } from '@/components/features/SearchAndFilters'
// import { BugCard } from '@/components/features/BugCard'

// interface Bug {
//   id: string
//   title: string
//   description: string
//   tags: string[]
//   status: 'open' | 'answered' | 'solved' | 'closed'
//   createdBy: string
//   createdAt: any
//   votes: number
//   answerCount?: number
// }

// export default function FeedPage() {
//   const [bugs, setBugs] = useState<Bug[]>([])
//   const [loading, setLoading] = useState(true)
//   const [loadingMore, setLoadingMore] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedTag, setSelectedTag] = useState('')
//   const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)
//   const [hasMore, setHasMore] = useState(true)

//   const BUGS_PER_PAGE = 10

//   const fetchBugs = async (isLoadMore = false) => {
  
//     try {
//       if (isLoadMore) {
//         setLoadingMore(true)
//       } else {
//         setLoading(true)
//       }

//       let q = query(
//         collection(db, 'bugs'),
//         orderBy('createdAt', 'desc'),
//         limit(BUGS_PER_PAGE)
//       )

//       if (isLoadMore && lastDoc) {
//         q = query(
//           collection(db, 'bugs'),
//           orderBy('createdAt', 'desc'),
//           startAfter(lastDoc),
//           limit(BUGS_PER_PAGE)
//         )
//       }

//       const querySnapshot = await getDocs(q)
//       const newBugs = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })) as Bug[]

//       if (isLoadMore) {
//         setBugs(prev => [...prev, ...newBugs])
//       } else {
//         setBugs(newBugs)
//       }

//       if (querySnapshot.docs.length > 0) {
//         setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1])
//       }

//       setHasMore(querySnapshot.docs.length === BUGS_PER_PAGE)

//     } catch (error) {
//       console.error('Error fetching bugs:', error)
//     } finally {
//       setLoading(false)
//       setLoadingMore(false)
//     }
//   }

//   useEffect(() => {
//     fetchBugs()
//   }, [])

//   const filteredBugs = bugs.filter(bug => {
//     const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          bug.description.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesTag = !selectedTag || bug.tags.includes(selectedTag)
//     return matchesSearch && matchesTag
//   })

//   const allTags = Array.from(new Set(bugs.flatMap(bug => bug.tags)))

//   if (loading) {
//     return <BugSkeleton/>
//   }
 
//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold mb-2">Bug Feed</h1>
//         <p className="text-gray-600">Community debugging solutions</p>
//       </div>

//       <SearchAndFilters
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         selectedTag={selectedTag}
//         setSelectedTag={setSelectedTag}
//         allTags={allTags}
//       />

//       <div className="space-y-4">
//         {filteredBugs.length === 0 ? (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center py-12">
//               <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
//               <h3 className="text-lg font-semibold text-gray-600 mb-2">No bugs found</h3>
//               <p className="text-gray-500 text-center">
//                 {searchTerm || selectedTag 
//                   ? "Try adjusting your search or filters" 
//                   : "Be the first to submit a bug report!"
//                 }
//               </p>
//             </CardContent>
//           </Card>
//         ) : (
//           filteredBugs.map(bug => (
//             <BugCard key={bug.id} bug={bug} />
//           ))
//         )}
//       </div>

//       {hasMore && !searchTerm && !selectedTag && (
//         <div className="flex justify-center mt-8">
//           <Button
//             onClick={() => fetchBugs(true)}
//             disabled={loadingMore}
//             variant="outline"
//           >
//             {loadingMore ? 'Loading...' : 'Load More'}
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }