import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// ... 기존 import 동일
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // 현재 가장 안정적인 모델로 설정
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      "영수증 정보를 'YYYY-MM-DD | 상호명 | 핵심품목 | 금액원' 형태로 한 줄만 반환해줘.",
      { inlineData: { data: base64Data, mimeType: file.type || 'image/jpeg' } }
    ]);

    return NextResponse.json({ text: result.response.text().trim() });
  } catch (error: any) {
    // 구글 API의 에러 상태 코드를 추출 (없으면 500)
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
