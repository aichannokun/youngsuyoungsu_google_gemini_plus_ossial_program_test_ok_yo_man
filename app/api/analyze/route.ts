import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 });
    const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash' });
    const prompt = "영수증 날짜, 상호명, 품목, 합계 금액을 파악해서 'YYYY-MM-DD | 상호명 | 핵심품목 | 금액원' 형태로 한 줄만 반환해줘.";
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
    ]);
    return NextResponse.json({ text: result.response.text().trim() });
  } catch (error) {
    return NextResponse.json({ error: '분석 실패' }, { status: 500 });
  }
}
