import { Card, CardHeader, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

const BugLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="p-6">
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <div className="flex space-x-2 mt-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>
  )
}

export default BugLoading