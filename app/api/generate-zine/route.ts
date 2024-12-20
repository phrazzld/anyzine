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
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'you are a helpful assistant generating strictly json.' },
        {
          role: 'user',
          content: `subject: ${subject}. produce a zine as json with the following keys:
{
"title": string,
"editorial": string (2-3 paragraphs),
"opinion": string (1 paragraph),
"funFacts": array of 3-5 short strings
}
do not include any extra text outside the json.`
        }
      ],
      temperature: 0.7
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
