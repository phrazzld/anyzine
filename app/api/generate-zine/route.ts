// app/api/generate-zine/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { subject } = await request.json();

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    return NextResponse.json({ error: 'invalid subject' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'openai api key not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
you are a neobrutalist zine writer generating strictly json for a magazine about ${subject}.
your style is concise, edgy, bold, and you use minimal fluff.
you do not include any code fences or markup outside of json.
output valid json with these sections:
1) banner: a bold, snappy uppercase headline
2) subheading: a single-sentence tagline or subhead
3) intro: 1 short paragraph that sets up the topic
4) mainArticle: 3-5 paragraphs providing more depth
5) opinion: 2-3 short, strongly stated paragraphs
6) funFacts: array of 3-5 bullet points
7) conclusion: 1-2 short wrap-up paragraphs
return the result in the shape:
{
  "sections": [
    {"type":"banner","content":"..."},
    {"type":"subheading","content":"..."},
    {"type":"intro","content":"..."},
    {"type":"mainArticle","content":"..."},
    {"type":"opinion","content":"..."},
    {"type":"funFacts","content":["...","..."]},
    {"type":"conclusion","content":"..."}
  ]
}
      `
        },
        {
          role: 'user',
          content: `produce the json now. no extra text outside of the json.`
        }
      ],
      temperature: 0.8
    });

    const rawText = response.choices[0]?.message?.content?.trim();
    if (!rawText) {
      return NextResponse.json({ error: 'no content returned' }, { status: 500 });
    }

    let zineData;
    try {
      zineData = JSON.parse(rawText);
    } catch (err) {
      return NextResponse.json({ error: 'failed to parse json' }, { status: 500 });
    }

    return NextResponse.json(zineData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'unexpected error' }, { status: 500 });
  }
}
