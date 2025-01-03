"use client";

import React, { useState } from "react";
import { TZineSection, ZineDisplay } from "./ZineDisplay";
import { SUBJECTS } from "@/app/constants";

export default function SubjectForm() {
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [zineData, setZineData] = useState<{ sections: TZineSection[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError("please enter a subject");
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
        setError(errData.error || "unknown error");
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
            placeholder="enter a subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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
