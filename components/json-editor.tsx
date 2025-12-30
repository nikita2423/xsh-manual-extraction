"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check } from "lucide-react";

interface JsonEditorProps {
  data: Record<string, any>;
  onInsert: (data: Record<string, any>) => Promise<void>;
  loading: boolean;
}

export function JsonEditor({ data, onInsert, loading }: JsonEditorProps) {
  const [editedData, setEditedData] = useState<Record<string, any>>(data);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const handleFieldChange = (key: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(editedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertClick = () => {
    onInsert(editedData);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">JSON Editor</h2>
          <p className="text-sm text-muted-foreground">
            Edit the extracted data before inserting
          </p>
        </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          JSON Format
        </label>
        <div className="bg-muted/50 border border-border rounded-lg p-4 max-h-40 overflow-y-auto">
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
            {JSON.stringify(editedData, null, 2)}
          </pre>
        </div>
      </div>

      {/* JSON Fields Editor */}
      <div className="space-y-3 max-h-96 overflow-y-auto bg-muted/30 rounded-lg p-4 border border-border">
        {Object.entries(editedData).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium text-foreground">{key}</label>
            {typeof value === "object" && value !== null ? (
              <textarea
                value={JSON.stringify(value, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleFieldChange(key, parsed);
                  } catch {
                    // Keep the original on invalid JSON
                  }
                }}
                disabled={loading}
                className="w-full min-h-20 p-2 bg-background border border-border rounded text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <input
                type={typeof value === "number" ? "number" : "text"}
                value={value ?? ""}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={handleInsertClick}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-base rounded-lg transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inserting...
          </>
        ) : (
          "Insert Data"
        )}
      </Button>
    </div>
  );
}
