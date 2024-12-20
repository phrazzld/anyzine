'use client';

import React, { useState } from 'react';

export default function SubjectForm() {
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [zineData, setZineData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('please enter a subject');
      return;
    }
    setError(null);
    setLoading(true);
    setZineData(null);

    try {
      const res = await fetch('/api/generate-zine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim() })
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'unknown error');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setZineData(data);
    } catch (err: any) {
      setError('network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          className="border p-2 flex-1"
          placeholder="enter a subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <button type="submit" className="bg-black text-white px-4 py-2">go</button>
      </form>
      {loading && <div className="text-center text-sm">loading...</div>}
      {error && <div className="text-center text-red-500 text-sm">{error}</div>}
      {zineData && (
        <div className="space-y-4 mt-8">
          <h1 className="text-3xl font-bold">{zineData.title}</h1>
          <div className="space-y-2">
            {zineData.editorial.split('\n').map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="bg-gray-100 p-4">
            <h2 className="font-semibold">opinion:</h2>
            <p>{zineData.opinion}</p>
          </div>
          <div>
            <h2 className="font-semibold">fun facts:</h2>
            <ul className="list-disc list-inside">
              {zineData.fun_facts.map((fact: string, i: number) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
