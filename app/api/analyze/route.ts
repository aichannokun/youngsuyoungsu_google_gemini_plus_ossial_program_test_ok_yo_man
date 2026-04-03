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
    이미지에서 영수증의 '상품명', '단가', '수량', '금액' 열을 정확히 구분하여 분석해줘.
    특히 상품명 뒤의 숫자가 상품명의 일부(예: 500g, 12호)인지, 실제 구매 수량인지 명확히 구분해야 해.

    다음 규격을 엄격히 지켜서 출력해:

    ------------------------------------------------------------
    소비 금액 / 배송(해당 시에만 표기)

    판매액 : [할인 전 총액]
    할인액 : -[할인 총액]
        ([할인명] : -금액)

    포인트/적립금 사용 : -[금액]([포인트이름])

    최종금액 : ([결제수단]) [실제 결제 금액]

    -판매처 : [이마트 등 상호명]
    [[상품명]]
        ([수량]개 x [단가]원)
    ------------------------------------------------------------

    주의사항:
    1. 상품명은 이미지에 적힌 그대로 최대한 정확하게 읽어줘 (추측 금지).
    2. 수량(Qty) 컬럼의 숫자를 반드시 찾아내서 ([수량]개 x [단가]원) 형식으로 옵션란에 넣어줘.
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
