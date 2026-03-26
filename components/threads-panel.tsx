"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface ThreadsPanelProps {
  onExtract: (input: string, keyword: string, date?: string) => Promise<void>;
  loading: boolean;
  input: string;
  setInput: (input: string) => void;
}

const KEYWORDS = [{ value: "香港快運", label: "香港快運" }];

export function ThreadsPanel({
  onExtract,
  loading,
  input,
  setInput,
}: ThreadsPanelProps) {
  const [keyword, setKeyword] = useState("bochk");
  const [includeDate, setIncludeDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const savedKeyword = localStorage.getItem("threadsKeyword");
    const savedIncludeDate = localStorage.getItem("threadsIncludeDate");
    const savedDate = localStorage.getItem("threadsSelectedDate");

    if (savedKeyword) setKeyword(savedKeyword);
    if (savedIncludeDate) setIncludeDate(JSON.parse(savedIncludeDate));
    if (savedDate) setSelectedDate(savedDate);
  }, []);

  useEffect(() => {
    localStorage.setItem("threadsKeyword", keyword);
  }, [keyword]);

  useEffect(() => {
    localStorage.setItem("threadsIncludeDate", JSON.stringify(includeDate));
  }, [includeDate]);

  useEffect(() => {
    localStorage.setItem("threadsSelectedDate", selectedDate);
  }, [selectedDate]);

  const selectedLabel =
    KEYWORDS.find((k) => k.value === keyword)?.label || keyword;

  const handleClick = () => {
    if (input.trim()) {
      onExtract(input, selectedLabel, includeDate ? selectedDate : undefined);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Threads Insertor
        </h2>
        <p className="text-sm text-muted-foreground">
          Paste a Threads post to extract username, message &amp; link
        </p>
      </div>

      {/* Keyword Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Select Keyword
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
          {KEYWORDS.map((k) => (
            <button
              key={k.value}
              onClick={() => setKeyword(k.value)}
              disabled={loading}
              className={`px-4 py-3 rounded-lg font-medium text-sm transition-all border ${
                keyword === k.value
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-input border-border text-foreground hover:border-primary/50"
              } disabled:opacity-50`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {/* Include Date Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="threads-include-date"
          checked={includeDate}
          onCheckedChange={(checked) => setIncludeDate(checked as boolean)}
          disabled={loading}
        />
        <label
          htmlFor="threads-include-date"
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          Include Date Selection
        </label>
      </div>

      {/* Date Selection */}
      {includeDate && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>
      )}

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Paste Threads post here...\n\nExample:\n@hk_express 你哋真係有撚病\nhttps://www.threads.com/@wilson._.tanggg/post/DWVuaA0E2T8`}
        disabled={loading}
        className="min-h-64 resize-none bg-input border border-border text-foreground placeholder:text-muted-foreground"
      />

      <Button
        onClick={handleClick}
        disabled={loading || !input.trim() || (includeDate && !selectedDate)}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-base rounded-lg transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Extracting...
          </>
        ) : (
          "Extract Threads Data"
        )}
      </Button>
    </div>
  );
}
