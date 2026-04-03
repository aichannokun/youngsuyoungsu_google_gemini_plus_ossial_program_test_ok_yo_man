import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 });

    const mimeType = file.type || 'image/jpeg';
    const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');

  // ... 생략 (기존 import)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // 'latest' 별칭을 사용하여 항상 최신 플래시 모델을 호출합니다.
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = "영수증 날짜, 상호명, 품목, 합계 금액을 파악해서 'YYYY-MM-DD | 상호명 | 핵심품목 | 금액원' 형태로 한 줄만 반환해줘.";
  // ... 생략
    
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);

    return NextResponse.json({ text: result.response.text().trim() });
  } catch (error: any) {
    console.error("Gemini API 에러 발생:", error.message);
    return NextResponse.json({ error: `분석 실패: ${error.message}` }, { status: 500 });
  }
}
