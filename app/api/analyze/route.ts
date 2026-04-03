import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 });

    const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // 유저님 계정에서 성공이 확인된 2.5-flash 모델 사용
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    영수증이나 구매내역 이미지를 분석하여 아래 규격에 맞춰 응답해줘.
    정보가 없는 항목은 생략하거나 공란으로 둬. 계층 구조는 공백(Space) 4칸으로 들여쓰기해줘.

    ------------------------------------------------------------
    소비 금액 / 배송(온라인 쇼핑몰 영수증인 경우만 '배송' 표기)

    판매액 : [금액]
    할인액 : -[금액]
        (즉시할인: -금액)
        ([쿠폰명/할인명] : -금액)

    포인트/적립금 사용 : -[금액]([포인트이름])

    최종금액 : ([결제수단/카드명]) [실제 결제 금액]

    -판매처 : [쇼핑몰/사이트/상호명]
    [[상품 제목]]
        ([옵션 정보가 있다면 기재])
    ------------------------------------------------------------
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: file.type || 'image/jpeg' } }
    ]);

    return NextResponse.json({ text: result.response.text().trim() });
  } catch (error: any) {
    // 404(모델만료), 503(과부하) 등 상태 코드를 프론트로 전달
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
