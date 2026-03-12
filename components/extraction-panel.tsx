"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface ExtractionPanelProps {
  onExtract: (
    input: string,
    timezone: string,
    bank: string,
    date?: string,
  ) => Promise<void>;
  loading: boolean;
  input: string;
  setInput: (input: string) => void;
}

const BANKS = [
  { value: "bochk", label: "中银香港 (BOCHK)" },
  { value: "scb", label: "渣打香港 (SCB)" },
  { value: "hsbc", label: "汇丰香港 (HSBC)" },
  { value: "hang_seng", label: "恒生香港 (Hang Seng)" },
  { value: "citi", label: "香港花旗 (Citi)" },
];

const BANK_PROMPTS: Record<string, string> = {
  bochk: "Extract transaction data from 中银香港 (BOCHK) statement",
  scb: "Extract transaction data from 渣打香港 (SCB) statement",
  hsbc: "Extract transaction data from 汇丰香港 (HSBC) statement",
  hang_seng: "Extract transaction data from 恒生香港 (Hang Seng) statement",
  citi: "Extract transaction data from 香港花旗 (Citi) statement",
};

export function ExtractionPanel({
  onExtract,
  loading,
  input,
  setInput,
}: ExtractionPanelProps) {
  const [timezone, setTimezone] = useState("IST");
  const [bank, setBank] = useState("bochk");
  const [includeDate, setIncludeDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  // Load bank, includeDate, and date from localStorage on mount
  useEffect(() => {
    const savedBank = localStorage.getItem("selectedBank");
    const savedIncludeDate = localStorage.getItem("includeDate");
    const savedDate = localStorage.getItem("selectedDate");

    if (savedBank) setBank(savedBank);
    if (savedIncludeDate) setIncludeDate(JSON.parse(savedIncludeDate));
    if (savedDate) setSelectedDate(savedDate);
  }, []);

  // Save bank to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("selectedBank", bank);
  }, [bank]);

  // Save includeDate to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("includeDate", JSON.stringify(includeDate));
  }, [includeDate]);

  // Save date to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("selectedDate", selectedDate);
  }, [selectedDate]);

  const handleClick = () => {
    if (input.trim()) {
      onExtract(input, timezone, bank, includeDate ? selectedDate : undefined);
    }
  };

  const bankPrompt = BANK_PROMPTS[bank] || "Extract transaction data";

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Input Data</h2>
        <p className="text-sm text-muted-foreground">{bankPrompt}</p>
      </div>

      {/* Bank Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Select Bank
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 flex">
          {BANKS.map((b) => (
            <button
              key={b.value}
              onClick={() => setBank(b.value)}
              disabled={loading}
              className={`px-4 py-3 rounded-lg font-medium text-sm transition-all border ${
                bank === b.value
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-input border-border text-foreground hover:border-primary/50"
              } disabled:opacity-50`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Include Date Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-date"
          checked={includeDate}
          onCheckedChange={(checked) => setIncludeDate(checked as boolean)}
          disabled={loading}
        />
        <label
          htmlFor="include-date"
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          Include Date Selection
        </label>
      </div>

      {/* Date Selection (Conditional) */}
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
        placeholder="Paste your data here..."
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
          "Extract Data"
        )}
      </Button>
    </div>
  );
}
