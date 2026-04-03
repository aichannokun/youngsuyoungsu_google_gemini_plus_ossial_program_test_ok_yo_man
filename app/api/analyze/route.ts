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
    이미지 분석 후 규격에 맞춰 한 줄 요약해. 설명 금지.

    1. 온라인 스샷 (알리/옥션 등):
    소비 금액 / 배송
    판매액 : [금액]
    할인액 : -[금액]
        ([이름] : -금액)
    포인트/적립금 : -[금액]
    최종금액 : ([결제수단]) [금액]
    -판매처 : [사이트명]
    [[상품명]] ([옵션])

    2. 종이 영수증 (촬영본):
    종이 영수증 분석
    합계 금액 : [총액]
    최종 결제 : ([카드사]) [금액]
    -판매처 : [상호명]
    [[대표품목 외 X건]]
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
