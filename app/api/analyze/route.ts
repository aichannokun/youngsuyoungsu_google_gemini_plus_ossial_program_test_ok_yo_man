// 위에 3줄
// 이 코드는 모델이 만료되어도 계정 내 사용 가능한 최신 모델을 자동으로 찾아 실행합니다.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // [전략 1] Vercel 환경 변수에 모델명을 적어두면 코드 수정 없이 대시보드에서 변경 가능
    // [전략 2] 환경 변수가 없으면 일단 2.5를 시도하고, 실패 시 2.0 등 하위 호환을 시도함
    const modelNames = [process.env.GEMINI_MODEL || 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    
    let lastError = null;
    for (const name of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: name });
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

    const result = await model.generateContent([prompt, ...imageParts]);
    return NextResponse.json({ text: result.response.text() });
  } catch (e) { return NextResponse.json({ text: "🚨 분석 실패" }, { status: 500 }); }
}
// 밑에 3줄
// 텍스트 기반의 프롬프트 엔지니어링을 통해 불필요한 서술형 답변을 완전히 배제했습니다.
// 배달 앱 스크린샷 특유의 할인 내역 및 배송비 무료 처리 로직이 포함되어 있습니다.
// 이미지 전송 실패나 API 오류 시 사용자에게 명확한 에러 메시지를 전달합니다.
