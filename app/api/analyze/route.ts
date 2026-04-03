import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: '파일 없음' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const modelNames = [
      process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ];

    const prompt = `
이미지를 분석하여 다음 두 가지 경우 중 하나로 출력해줘:

### [경우 1: 온라인 쇼핑몰 주문 내역/결제 완료 스크린샷인 경우]
- 특징: 깔끔한 디지털 이미지이며, 할인/쿠폰/옵션 정보가 명확함.
- 아래 규격에 맞춰 상세하게 분석:
------------------------------------------------------------
소비 금액 / 배송(온라인/스크린샷인 경우 '배송' 표기)
판매액 : [원래 판매 금액]
할인액 : -[총 할인 금액]
    (즉시할인: -금액)
    ([쿠폰명/할인명] : -금액)
포인트/적립금 사용 : -[금액]([포인트이름])
최종금액 : ([결제수단]) [실제 결제 금액]
-판매처 : [쇼핑몰/사이트명]
[[상품 제목]]
    ([옵션 정보])
------------------------------------------------------------

### [경우 2: 실제 종이 영수증을 촬영한 사진인 경우]
- 특징: 종이 질감이 보이거나, 기울어짐/흔들림이 있으며, 단순 합계 정보 위주임.
- 아래 규격에 맞춰 핵심 정보만 심플하게 분석 (세금, 품목별 단가 등은 생략):
------------------------------------------------------------
종이 영수증 분석 결과
합계 금액 : [영수증에 적힌 총합계]
최종 결제 금액 : ([결제수단/카드사]) [실제 지불 금액]
-판매처 : [상호명]
[[대표 품목]] (여러 개인 경우 대표 품목 하나 혹은 '...외 X건')
------------------------------------------------------------
`;

    const results: string[] = [];

    for (const file of files) {
      const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');
      let lastError = null;

      for (const name of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: name });
          const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: file.type || 'image/jpeg' } },
          ]);
          results.push(result.response.text().trim());
          break; // 성공했으면 다음 파일로
        } catch (err: any) {
          lastError = err;
          if (err.status === 404) continue; // 404면 다음 모델 시도
          throw err;
        }
      }

      if (lastError && results.length < files.indexOf(file) + 1) {
        throw lastError;
      }
    }

    return NextResponse.json({ text: results.join('\n\n---\n\n') });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
