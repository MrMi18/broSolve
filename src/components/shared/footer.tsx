import { Coffee, Heart } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
       <footer className="py-8 border-t border-gray-200/50 bg-white/30 mt-auto ">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BroSolve
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Powered by AI & Community</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <span className="flex items-center">
                Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> by developer, for developers
              </span>
              <Coffee className="w-4 h-4" />
            </div>
          </div>
        </div>
      </footer>
  )
}

export default Footer