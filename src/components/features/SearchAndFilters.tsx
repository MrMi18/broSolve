

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchAndFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedTag: string
  setSelectedTag: (tag: string) => void
  allTags: string[]
}

export function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedTag,
  setSelectedTag,
  allTags
}: SearchAndFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search bugs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedTag === '' ? 'default' : 'outline'}
          className="cursor-pointer "
          onClick={() => setSelectedTag('')}
        >
          All
        </Badge>
        {allTags.slice(0, 10).map(tag => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            className="cursor-pointer  "
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}