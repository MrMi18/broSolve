
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '../ui/card'

export default function BugSkeleton() {
     return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 w-full">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h- w-20" />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <div className="flex space-x-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
}
