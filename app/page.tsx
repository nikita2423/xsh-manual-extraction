"use client"

import { useState } from "react"
import { ExtractionPanel } from "@/components/extraction-panel"
import { JsonEditor } from "@/components/json-editor"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [jsonData, setJsonData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExtract = async (input: string, timezone: string) => {
    setLoading(true)
    setError(null)
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, timezone }),
      })

      if (!response.ok) throw new Error("Failed to extract data")
      const data = await response.json()
      setJsonData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = async (data: Record<string, any>) => {
    setLoading(true)
    setError(null)
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to insert data")
      const result = await response.json()
      setError(null)
      console.log("Insert successful:", result)
      alert("Data inserted successfully!")
      setJsonData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Data Extraction</h1>
          <p className="text-muted-foreground text-lg">Extract and edit JSON data with ease</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Panel - Extraction */}
          <Card className="bg-card border-border shadow-sm">
            <ExtractionPanel onExtract={handleExtract} loading={loading} />
          </Card>

          {/* Right Panel - Editor */}
          <Card className="bg-card border-border shadow-sm">
            {jsonData ? (
              <JsonEditor data={jsonData} onInsert={handleInsert} loading={loading} />
            ) : (
              <div className="p-8 h-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">Extract data to see it here</p>
                  <p className="text-sm text-muted-foreground">The JSON response will appear in this editor</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  )
}
