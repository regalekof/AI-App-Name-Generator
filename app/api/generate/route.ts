import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { theme } = await request.json()

    if (!theme || !theme.trim()) {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      )
    }

    // Try Google Gemini API first (FREE - no credit card needed)
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
              body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Based on this project description: "${theme}"

Generate 12 creative, SHORT domain names (just 1-2 words each). 

IMPORTANT RULES:
- Extract the CORE CONCEPT only - don't use the full description
- Names should be 1-2 short words maximum (like "fitly", "zenflow", "quickpay", "shopify")
- Create abstract, brandable names - NOT literal descriptions
- Examples: For "fitness tracking app" → generate names like: "fitly", "trackr", "moveapp", "gymflow" (NOT "fitness tracking app")
- For "e-commerce platform" → generate: "shoply", "cartly", "sellio", "baskit" (NOT "e-commerce platform")
- Make them catchy, memorable, and easy to spell

Return ONLY a JSON array of domain names (no TLD), no explanations. Example: ["fitly", "trackr", "moveapp"]`
                }]
              }],
              generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 300,
              }
            }),
          }
        )

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json()
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
          let names = extractNamesFromText(text)
          
          // Filter and clean names - remove long names and descriptions
          names = names
            .filter(name => {
              const clean = name.toLowerCase().trim()
              // Reject names longer than 15 characters or containing multiple spaces
              if (clean.length > 15 || clean.split(/\s+/).length > 2) return false
              // Reject if it contains the full description
              const descLower = theme.toLowerCase()
              if (clean.length > descLower.length * 0.8) return false
              return true
            })
            .map(name => name.toLowerCase().trim().replace(/\s+/g, '')) // Remove spaces
            .filter(name => name.length >= 3 && name.length <= 15) // Keep only 3-15 chars
            .slice(0, 12)
          
          if (names.length > 0) {
            return NextResponse.json({ names })
          }
        }
      } catch (error) {
        console.error('Gemini API error:', error)
        // Fall through to other options
      }
    }

    // Try OpenAI API as fallback (if API key provided)
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a creative domain name generator. Extract the core concept from descriptions and generate SHORT (1-2 words), abstract, brandable domain names. NEVER use the full description as a domain name. Create names like "shopify", "stripe", "zoom" - short, catchy, memorable. Return as JSON object with "names" key containing array of strings (domain name only, no TLD).'
              },
              {
                role: 'user',
                content: `Project description: "${theme}"

Extract the core concept and generate 12 SHORT, abstract domain names (1-2 words max). Examples:
- "fitness tracking app" → ["fitly", "trackr", "moveapp", "gymflow"]
- "e-commerce store" → ["shoply", "cartly", "sellio", "baskit"]

Create similar short, brandable names. Return JSON: {"names": ["name1", "name2", ...]}`
              }
            ],
            temperature: 0.9,
            max_tokens: 300,
            response_format: { type: 'json_object' }
          }),
        })

        if (response.ok) {
          const data = await response.json()
          let names: string[] = []

          try {
            const content = JSON.parse(data.choices[0]?.message?.content || '{}')
            names = content.names || Object.values(content)[0] || []
            
            if (!Array.isArray(names) || names.length === 0) {
              const text = data.choices[0]?.message?.content || ''
              names = extractNamesFromText(text)
            }
          } catch {
            const text = data.choices[0]?.message?.content || ''
            names = extractNamesFromText(text)
          }

          // Filter and clean names
          names = names
            .filter(name => {
              const clean = name.toLowerCase().trim()
              if (clean.length > 15 || clean.split(/\s+/).length > 2) return false
              const descLower = theme.toLowerCase()
              if (clean.length > descLower.length * 0.8) return false
              return true
            })
            .map(name => name.toLowerCase().trim().replace(/\s+/g, ''))
            .filter(name => name.length >= 3 && name.length <= 15)
            .slice(0, 12)

          if (names.length > 0) {
            return NextResponse.json({ names })
          }
        }
      } catch (error) {
        console.error('OpenAI API error:', error)
      }
    }

    // Final fallback: smart mock generation
    return NextResponse.json({
      names: generateSmartMockNames(theme)
    })
  } catch (error) {
    console.error('Error generating names:', error)
    return NextResponse.json(
      { error: 'Failed to generate names' },
      { status: 500 }
    )
  }
}

// Smart mock domain name generator (fallback when no API key)
function generateSmartMockNames(theme: string): string[] {
  // Extract key words from description (max 2-3 words)
  const words = theme.toLowerCase().trim().split(/\s+/).filter(w => w.length > 2).slice(0, 3)
  const mainWord = words[0] || 'project'
  
  const suffixes = ['ly', 'hub', 'flow', 'app', 'pro', 'io', 'ly', 'fy']
  const prefixes = ['get', 'my', 'the', 'try', 'go', 'zen', 'nova']
  const creative = ['zen', 'nova', 'apex', 'blaze', 'dash', 'roam', 'swift', 'peak', 'core', 'base']
  
  const names: string[] = []
  
  // Extract short version of main word (first 4-5 letters)
  const shortWord = mainWord.substring(0, 5)
  
  // Combine with suffixes
  suffixes.slice(0, 6).forEach(suffix => {
    names.push(`${shortWord}${suffix}`)
  })
  
  // Creative single-word names
  creative.slice(0, 3).forEach(word => {
    names.push(`${word}${shortWord}`)
    names.push(`${shortWord}${word}`)
  })
  
  // Add some standalone creative names
  names.push(shortWord)
  names.push(`${shortWord}ly`)
  
  // Return unique lowercase names, ensuring they're short
  return [...new Set(names.map(n => n.toLowerCase()).filter(n => n.length <= 12))].slice(0, 12)
}

// Extract names from text if API returns plain text
function extractNamesFromText(text: string): string[] {
  // Try to find JSON array
  const jsonMatch = text.match(/\[(.*?)\]/s)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch {}
  }
  
  // Try to find quoted strings
  const quotedMatches = text.match(/"([^"]+)"/g)
  if (quotedMatches) {
    return quotedMatches.map(m => m.replace(/"/g, '')).slice(0, 10)
  }
  
  // Try numbered list
  const listMatches = text.match(/\d+\.\s*([^\n]+)/g)
  if (listMatches) {
    return listMatches.map(m => m.replace(/^\d+\.\s*/, '').trim()).slice(0, 10)
  }
  
  return []
}

