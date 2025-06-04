import { useState, useEffect, useRef } from 'react'
import { StandardQuery } from '@/constants/StandardQuery'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Check, Database, Search, ArrowUp } from 'lucide-react'

function StandardQueryPage() {
  // Reference to the main container
  const containerRef = useRef<HTMLDivElement>(null)

  // State to track which queries have been copied
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  // State to track if we should show the back to top button
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Function to scroll back to top
  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Track scroll position to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setShowBackToTop(containerRef.current.scrollTop > 300)
      }
    }

    const currentContainer = containerRef.current
    if (currentContainer) {
      currentContainer.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  // Function to copy text to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Set this specific query as copied
      setCopiedStates(prev => ({ ...prev, [id]: true }))

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }))
      }, 2000)
    })
  }

  // Add state for search functionality
  const [searchTerm, setSearchTerm] = useState('')

  // Filter queries based on search term
  const filteredQueries = Object.entries(StandardQuery).map(([category, queries]) => {
    const filteredItems = searchTerm
      ? queries.filter(query => query.toLowerCase().includes(searchTerm.toLowerCase()))
      : queries

    return { category, queries: filteredItems }
  }).filter(({ queries }) => queries.length > 0)

  return (
    <ScrollArea className="h-full">
    <div ref={containerRef} className="container mx-auto py-6 px-4 h-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Standard Queries</h1>
          <p className="text-gray-600 mt-1">
            Select from our collection of standard queries to quickly analyze your data.
          </p>
        </div>

        {/* Search input */}
        <div className="relative mt-4 md:mt-0 max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search queries..."
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredQueries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No queries found</h3>
          <p className="text-gray-500">
            No queries match your search term. Try using different keywords.
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
            <div className="grid grid-cols-1 gap-6">
            {filteredQueries.map(({ category, queries }) => (
                <Card key={category} className="overflow-hidden shadow-sm">
                <CardHeader className="bg-gray-50 pb-3">
                    <div className="flex items-center">
                    <Database className="h-5 w-5 text-blue-500 mr-2" />
                    <CardTitle>{category}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-500 mt-1">
                    {queries.length} {queries.length === 1 ? 'query' : 'queries'} available
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {queries.map((query, index) => {
                        const queryId = `${category}-${index}`
                        const isCopied = copiedStates[queryId]

                        return (
                            <li key={index} className="flex items-start justify-between p-4 hover:bg-gray-50">
                            <div className="flex-1 pr-4">
                                <p className="text-sm text-gray-700">{query}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(query, queryId)}
                                className="shrink-0 text-gray-500 hover:text-gray-700"
                            >
                                {isCopied ? (
                                <Check size={16} className="text-green-500" />
                                ) : (
                                <Copy size={16} />
                                )}
                                <span className="ml-2">{isCopied ? 'Copied!' : 'Copy'}</span>
                            </Button>
                            </li>
                        )
                        })}
                    </ul>
                </CardContent>
                </Card>
            ))}
        </div>
      )}

      {/* Back to top button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </Button>
      )}
    </div>
    </ScrollArea>
  )
}

export default StandardQueryPage
