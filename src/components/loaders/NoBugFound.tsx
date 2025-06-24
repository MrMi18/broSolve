import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { useRouter } from "next/navigation"

const NoBugFound = () => {
    const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Bug not found</h3>
              <p className="text-gray-500 mb-6">We couldn&apos;t find what you&apos;re looking for.</p>
              <Button 
                onClick={() => router.push('/bugs')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Feed
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}

export default NoBugFound