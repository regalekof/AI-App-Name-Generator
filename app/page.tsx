"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Sparkles, RefreshCw, Globe, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const TLDS = ['.com', '.io', '.app', '.ai', '.co', '.dev', '.tech', '.xyz']
const POPULAR_TLDS = ['.com', '.io', '.app']

type DomainWithTLD = {
  name: string
  tld: string
}

export default function DomainNameGenerator() {
  const [description, setDescription] = useState("")
  const [domains, setDomains] = useState<DomainWithTLD[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTLDs, setSelectedTLDs] = useState<string[]>(['.com', '.io', '.app'])
  const { toast } = useToast()

  const generateDomains = async () => {
    if (!description.trim()) {
      toast({
        title: "Please describe your project",
        description: "Tell us what your website or business is about",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: description.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate domains')
      }

      const data = await response.json()
      const names = data.names || []
      
      // Combine each name with selected TLDs
      const domainsList: DomainWithTLD[] = []
      names.slice(0, 12).forEach((name: string) => {
        selectedTLDs.forEach(tld => {
          domainsList.push({ name: name.toLowerCase().trim(), tld })
        })
      })
      
      setDomains(domainsList)
    } catch (error) {
      console.error('Error generating domains:', error)
      toast({
        title: "Error",
        description: "Failed to generate domains. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (domain: string) => {
    navigator.clipboard.writeText(domain)
    toast({
      title: "Copied!",
      description: `"${domain}" copied to clipboard`,
    })
  }

  const toggleTLD = (tld: string) => {
    setSelectedTLDs(prev => 
      prev.includes(tld) 
        ? prev.filter(t => t !== tld)
        : [...prev, tld]
    )
  }

  const selectAllTLDs = () => {
    setSelectedTLDs(TLDS)
  }

  const getDomainDisplay = (domain: DomainWithTLD) => {
    return `${domain.name}${domain.tld}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform">
              <Globe className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Find Your Perfect Domain
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your business or project, and AI will generate perfect domain names for you.
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-2 shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          <CardHeader className="space-y-4 pb-6">
            <CardTitle className="text-3xl text-center">Describe Your Project</CardTitle>
            <CardDescription className="text-center text-base">
              Tell us about your website, business, or project. We'll generate perfect domain names based on your description.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-3">
                <textarea
                  placeholder="Example: A fitness app that helps people track workouts and provides personalized training plans..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isGenerating) {
                      generateDomains()
                    }
                  }}
                  className="flex-1 w-full min-h-[120px] p-4 text-base text-lg border-2 rounded-lg resize-y focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Be specific about what your project does. The more details, the better the domain suggestions!
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={generateDomains}
                  disabled={isGenerating}
                  size="lg"
                  className="h-14 px-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>

              {/* TLD Selector */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    Select TLDs (Top Level Domains)
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllTLDs}
                    className="text-xs h-7"
                  >
                    Select All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TLDS.map((tld) => (
                    <Button
                      key={tld}
                      variant={selectedTLDs.includes(tld) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTLD(tld)}
                      className={`h-9 text-sm font-mono ${
                        selectedTLDs.includes(tld)
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : ''
                      }`}
                    >
                      {tld}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Domains */}
            {domains.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-lg font-semibold">
                    Generated Domains ({domains.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateDomains}
                    disabled={isGenerating}
                    className="h-9"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    Generate More
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-2">
                  {domains.map((domain, index) => {
                    const domainStr = getDomainDisplay(domain)
                    const isPopular = POPULAR_TLDS.includes(domain.tld)
                    return (
                      <div
                        key={`${domain.name}-${domain.tld}-${index}`}
                        className={`group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 animate-in fade-in slide-in-from-left-2 ${
                          isPopular
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800'
                            : 'bg-accent/50 border-border/30 hover:border-purple-300 dark:hover:border-purple-700'
                        }`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-foreground text-sm md:text-base truncate">
                              {domain.name}
                            </span>
                            <span className={`font-mono font-bold ${
                              isPopular ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'
                            }`}>
                              {domain.tld}
                            </span>
                            {isPopular && (
                              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(domainStr)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 ml-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                        >
                          <Copy className="w-4 h-4" />
                          <span className="sr-only">Copy {domainStr}</span>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {domains.length === 0 && !isGenerating && (
              <div className="text-center py-16 text-muted-foreground">
                <div className="mb-4">
                  <Globe className="w-16 h-16 mx-auto opacity-20" />
                </div>
                <p className="text-base font-medium mb-2">Ready to discover your perfect domain?</p>
                <p className="text-sm">Describe your project above and let AI generate creative domain names for you</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2 pb-8">
          <p className="text-sm text-muted-foreground">
            ✨ Powered by AI • Generate unlimited creative domain names
          </p>
          <p className="text-xs text-muted-foreground/70">
            All domain suggestions are AI-generated. Check availability before purchase.
          </p>
        </div>
      </div>
    </div>
  )
}
