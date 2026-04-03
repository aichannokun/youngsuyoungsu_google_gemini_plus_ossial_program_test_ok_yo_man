import { GoogleGenerativeAI } from '@google/generativeai';
import { NextResponse } from 'next/server';

// [Gemini API 호출 및 결과 반환 로직]
export async function POST(req: Request) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash' });

  const formData = await req.formData();
  const file = formData.get('image') as File;
  const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');

  const prompt = "날짜, 상호명, 품목, 금액을 'YYYY-MM-DD | 상호 | 품목 | 금액' 형식으로 한 줄 요약해.";
  const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }]);

  return NextResponse.json({ text: result.response.text().trim() });
}