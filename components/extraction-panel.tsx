"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ExtractionPanelProps {
  onExtract: (input: string, timezone: string) => Promise<void>;
  loading: boolean;
  input: string;
  setInput: (input: string) => void;
}

export function ExtractionPanel({
  onExtract,
  loading,
  input,
  setInput,
}: ExtractionPanelProps) {
  const [timezone, setTimezone] = useState("IST");

  const handleClick = () => {
    if (input.trim()) {
      onExtract(input, timezone);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Input Data</h2>
        <p className="text-sm text-muted-foreground">
          Enter the data you want to extract
        </p>
      </div>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your data here..."
        disabled={loading}
        className="min-h-64 resize-none bg-input border border-border text-foreground placeholder:text-muted-foreground"
      />
      {/* 
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        >
          <option value="IST">IST (Indian Standard Time)</option>
          <option value="HKT">HKT (Hong Kong Time)</option>
        </select>
      </div> */}

      <Button
        onClick={handleClick}
        disabled={loading || !input.trim()}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-base rounded-lg transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Extracting...
          </>
        ) : (
          "Extract Data"
        )}
      </Button>
    </div>
  );
}
