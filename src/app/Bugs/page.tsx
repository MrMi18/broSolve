
"use client"

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import BugSkeleton from '@/components/features/BugSkeleton'
import { SearchAndFilters } from '@/components/features/SearchAndFilters'
import { BugCard } from '@/components/features/BugCard'

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

  if (loading) {
    return <BugSkeleton/>
  }
 
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bug Feed</h1>
        <p className="text-gray-600">Community debugging solutions</p>
      </div>

      <SearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        allTags={allTags}
      />

      <div className="space-y-4">
        {filteredBugs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No bugs found</h3>
              <p className="text-gray-500 text-center">
                {searchTerm || selectedTag 
                  ? "Try adjusting your search or filters" 
                  : "Be the first to submit a bug report!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBugs.map(bug => (
            <BugCard key={bug.id} bug={bug} />
          ))
        )}
      </div>

      {hasMore && !searchTerm && !selectedTag && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => fetchBugs(true)}
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}