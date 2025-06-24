"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Sparkles, ChevronDown, ChevronUp, Copy, Check, AlertCircle, RefreshCw } from "lucide-react"
import axios from "axios"

interface Bug {
  title: string
  description: string
}

// AI Suggestion Component JSX
const AiSuggestionSection = (bug: Bug) => {
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiExpanded, setAiExpanded] = useState(false)
  const [aiError, setAiError] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchAiSuggestion = async (bug: Bug) => {
    if (aiSuggestion) {
      setAiExpanded(!aiExpanded)
      return
    }

    try {
      setAiLoading(true)
      setAiError('')
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      const body = {
        title: bug.title,
        description: bug.description,
      }
      const response = await axios.post('/api/openai/generateAnswer', body, config)

      setAiSuggestion(response.data.suggestion)
      setAiExpanded(true)
      
    } catch (error) {
      
      console.error('Error fetching AI suggestion:', error)
      setAiError('Failed to get AI suggestion. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiSuggestion)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const formatAiResponse = (text: string) => {
    // Split text into lines and process each line
    const lines = text.split('\n').filter(line => line.trim() !== '')
    const formatted = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Check if line starts with a number followed by a dot and space
      const numberMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/)
      
      if (numberMatch) {
        formatted.push({
          number: numberMatch[1],
          content: numberMatch[2]
        })
      } else if (trimmedLine) {
        // For non-numbered lines, add without number
        formatted.push({
          number: '',
          content: trimmedLine
        })
      }
    }
    
    // If no structured content found, return the original text as single block
    return formatted.length > 0 ? formatted : [{ number: '', content: text }]
  }

  return (
    <Card className="border-l-4 border-l-gradient-to-b from-blue-500 to-purple-600 bg-gradient-to-br from-slate-50 to-blue-50/30 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="pt-6">
        {/* Header Button */}
        <button
          onClick={() => fetchAiSuggestion(bug)}
          className="group flex items-center justify-between w-full p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          disabled={aiLoading}
        >
          <div className="flex items-center space-x-3">
            {aiLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            )}
            <span className="text-lg font-semibold">
              {aiLoading ? 'AI is thinking...' : "Here's what AI suggests"}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {aiLoading && (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
              </div>
            )}
            {!aiLoading && (
              <>
                {!aiExpanded && !aiSuggestion && (
                  <span className="text-sm text-blue-100">Click to get insights</span>
                )}
                {aiSuggestion && (
                  <div className="flex items-center space-x-1">
                    {aiExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </button>
        
        {/* Error State */}
        {aiError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">Oops! Something went wrong</p>
                <p className="text-red-600 text-sm mt-1">{aiError}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fetchAiSuggestion(bug)}
                  className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-100 p-2 h-8"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Response */}
        {aiExpanded && aiSuggestion && (
          <div className="mt-4 animate-in slide-in-from-top-2 duration-500">
            <div className="bg-white border border-blue-200 rounded-xl shadow-sm overflow-hidden">
              {/* Response Header */}
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">AI-Powered Solution</h4>
                    <p className="text-xs text-gray-500">Generated just for your bug</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-gray-500 hover:text-gray-700 hover:bg-white/50 p-2 h-8"
                    title="Copy response"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiExpanded(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-white/50 p-2 h-8"
                    title="Collapse"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Response Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {formatAiResponse(aiSuggestion).map((section, index) => (
                    <div key={index} className={`${section.number ? 'flex items-start space-x-3' : ''}`}>
                      {section.number && (
                        <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {section.number}
                        </span>
                      )}
                      <div className={section.number ? 'flex-1' : ''}>
                        <p className="text-gray-700 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-600">💡</span>
                    <span className="text-xs text-amber-700 font-medium">
                      AI-generated content - Please verify before implementing
                    </span>
                  </div>
                  <div className="text-xs text-amber-600">
                    Powered by GPT-4
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AiSuggestionSection