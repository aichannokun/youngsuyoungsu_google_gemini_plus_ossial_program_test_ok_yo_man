import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    const prompt = `이미지를 분석하여 아래 두 형식 중 하나로만 출력해줘.
구분선, 설명 문구, 반복 출력 없이 결과만 딱 한 번 출력할 것.

[온라인 쇼핑몰 주문 내역 또는 결제 완료 스크린샷인 경우]
소비 금액 / 배송
판매액 : 원래 판매 금액
할인액 : -총 할인 금액
    (즉시할인: -금액)
    (쿠폰명/할인명 : -금액)
포인트/적립금 사용 : -금액(포인트이름)
최종금액 : (결제수단) 실제 결제 금액
-판매처 : 쇼핑몰/사이트명
[상품 제목]
    (옵션 정보)

[종이 영수증을 촬영한 사진인 경우]
종이 영수증 분석 결과
합계 금액 : 영수증에 적힌 총합계
최종 결제 금액 : (결제수단/카드사) 실제 지불 금액
-판매처 : 상호명
[대표 품목] (여러 개인 경우 '...외 X건')`;

    const results: string[] = [];

    for (const file of files) {
      const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');
      let lastError = null;
      let success = false;

      for (let i = 0; i < modelNames.length; i++) {
        if (i > 0) await sleep(3000); // 재시도 전 3초 대기
        try {
          const model = genAI.getGenerativeModel({ model: modelNames[i] });
          const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: file.type || 'image/jpeg' } },
          ]);
          results.push(result.response.text().trim());
          success = true;
          break;
        } catch (err: any) {
          lastError = err;
          continue;
        }
      }

      if (!success) throw lastError;
    }

    return NextResponse.json({ text: results.join('\n\n---\n\n') });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
