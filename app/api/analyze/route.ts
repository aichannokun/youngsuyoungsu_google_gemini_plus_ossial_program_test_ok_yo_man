import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // [전략] 2.5 시도 후 실패 시 2.0으로 자동 전환
    const modelNames = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    
    const prompt = `
    이미지 분석 후 다음 규격으로만 응답해. 제목이나 설명 절대 금지.

    [금액 1 (합계)]
    [금액 2 (부가세 등 필요시)]
    [금액 3 (기타 금액)]
    
    ([거래날짜 YYYY-MM-DD HH:mm])
    - [상점명] ([전화번호])
    [상점주소]
    [기타 메모가 필요한 정보만 짧게]

    * 온라인 스크린샷인 경우에도 위 형식을 최대한 유지하되, 하단에 상품명만 추가해.
    `;

    for (const name of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: file.type || 'image/jpeg' } }
        ]);
        return NextResponse.json({ text: result.response.text().trim() });
      } catch (err: any) {
        if (err.status === 404 && name !== modelNames[modelNames.length - 1]) continue;
        throw err;
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
