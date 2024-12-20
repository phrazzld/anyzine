import { NextResponse } from 'next/server';

// TODO: refactor to use openai npm package, and:
// - better model
// - structured outputs
// - dynamic descriptions and prompts for:
//   - zine section, title and description
//   - contributor profiles

export async function POST(request: Request) {
  const { subject } = await request.json();

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    return NextResponse.json({ error: 'invalid subject' }, { status: 400 });
  }

  // craft prompt messages for openai
  const messages = [
    { role: 'system', content: 'you are a helpful assistant generating strictly json.' },
    {
      role: 'user', content: `subject: ${subject}. produce a zine as json with the following keys:
{
"title": string,
"editorial": string (2-3 paragraphs),
"opinion": string (1 paragraph),
"fun_facts": array of 3-5 short strings
}
do not include any extra text outside the json.` }
  ];

  // call openai api
  // ensure OPENAI_API_KEY is in .env file at project root: OPENAI_API_KEY=sk-...
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'openai api key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'failed to call openai api' }, { status: 500 });
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content?.trim();
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
    return NextResponse.json({ error: 'unexpected error' }, { status: 500 });
  }
}
