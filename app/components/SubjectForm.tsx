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
      <section className="mb-8">
        <form className="flex gap-2 items-center" onSubmit={handleSubmit}>
          <input type="text" className="border-4 border-black p-2 text-xl w-full" placeholder="enter a subject" onChange={(e) => setSubject(e.target.value)} />
          <button type="submit" className="border-4 border-black bg-black text-white p-2 uppercase font-bold">go</button>
        </form>
      </section>

      {loading && <div className="text-center text-sm">loading...</div>}

      {error && <div className="text-center text-red-500 text-sm">{error}</div>}

      {zineData && (
        <div className="space-y-4 mt-8">
          <h2 className="text-3xl font-bold uppercase border-b-4 border-black pb-2 mb-4">{zineData.title}</h2>
          <section className="border-4 border-black p-4 mb-4">
            {zineData.editorial.split('\n').map((p: string, i: number) => <p className="mb-4" key={i}>{p}</p>)}
          </section>
          <section className="border-4 border-black p-4 mb-4 bg-yellow-200">
            <h3 className="uppercase font-bold mb-2">opinion</h3>
            <p>{zineData.opinion}</p>
          </section>
          <section className="border-4 border-black p-4">
            <h3 className="uppercase font-bold mb-2">fun facts</h3>
            <ul className="list-disc pl-8">
              {zineData.funFacts.map((fact: string, i: number) => <li key={i} className="mb-2">{fact}</li>)}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
