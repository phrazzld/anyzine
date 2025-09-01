"use client";

import React, { useState } from "react";
import { TZineSection, ZineDisplay } from "./ZineDisplay";
import { SUBJECTS } from "@/app/constants";

export default function SubjectForm() {
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [zineData, setZineData] = useState<{ sections: TZineSection[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Client-side validation matching server-side security checks
  const validateSubject = (input: string) => {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return "please enter a subject";
    }
    if (trimmed.length < 2) {
      return "subject must be at least 2 characters";
    }
    if (trimmed.length > 200) {
      return "subject must be 200 characters or less";
    }

    // Check for common prompt injection patterns
    const dangerousPatterns = [
      /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
      /forget\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
      /you\s+are\s+(now\s+)?a\s+/i,
      /pretend\s+(you\s+are|to\s+be)/i,
      /system\s*[:.]?\s*(prompt|message)/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return "subject contains invalid patterns";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateSubject(subject);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    setLoading(true);
    setZineData(null);

    try {
      const res = await fetch("/api/generate-zine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim() }),
      });
      if (!res.ok) {
        const errData = await res.json();
        
        // Handle rate limiting with specific feedback
        if (res.status === 429) {
          const retryAfter = errData.retryAfter || 60;
          setError(`Too many requests. Please wait ${retryAfter} seconds before trying again.`);
        } else {
          setError(errData.error || "unknown error");
        }
        
        setLoading(false);
        return;
      }
      const data = await res.json();
      setZineData(data);
    } catch (err: any) {
      setError("network error");
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSubject(newValue);
    
    // Clear error if input is now valid, show error if invalid
    const validationError = validateSubject(newValue);
    if (error && !validationError) {
      setError(null); // Clear error if input becomes valid
    }
  };

  // handle random subject
  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * SUBJECTS.length);
    setSubject(SUBJECTS[randomIndex]);
    setError(null);
  };

  return (
    <div className="w-full">
      <section className="p-6 border-2 border-black">
        <form className="flex gap-2 items-center" onSubmit={handleSubmit}>
          <input
            type="text"
            className="border-2 border-black p-2 text-xl w-full"
            placeholder="enter a subject (max 200 chars)"
            value={subject}
            onChange={handleInputChange}
            maxLength={250}
          />
          <button
            type="button"
            onClick={handleRandom}
            className="
              border-2 border-black bg-gray-200 text-black px-4 py-2 uppercase font-bold
              transition-transform transform-gpu duration-150
              hover:-translate-y-1
              active:translate-y-1
            "
          >
            random
          </button>
          <button
            type="submit"
            className="
              border-2 border-black bg-violet-600 text-white px-4 py-2 uppercase font-bold
              transition-transform transform-gpu duration-150
              hover:-translate-y-1
              active:translate-y-1
            "
          >
            create
          </button>
        </form>
      </section>

      {/* loading */}
      {loading && (
        <div className="p-6 border-2 border-t-0 border-black text-center">
          <div className="flex justify-center items-center gap-2">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
            <span className="uppercase font-bold">generating...</span>
          </div>
        </div>
      )}

      {/* error */}
      {error && !loading && (
        <div className="p-6 border-2 border-red-500 bg-red-100 text-red-800 text-center text-sm rounded">
          {error}
        </div>
      )}

      {/* empty */}
      {!zineData && !loading && !error && (
        <div className="p-6 border-2 border-t-0 border-black text-center flex flex-col items-center">
          <span className="text-4xl mb-2">🤔</span>
          <p>no zine yet. enter a subject above or click random.</p>
        </div>
      )}

      {/* zine */}
      {zineData && <ZineDisplay sections={zineData.sections} />}
    </div>
  );
}
