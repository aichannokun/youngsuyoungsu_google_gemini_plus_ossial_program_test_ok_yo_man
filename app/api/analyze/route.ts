// 위에 3줄
// 여러 장의 이미지를 동시에 수신하여 Gemini 1.5 Flash 모델로 통합 분석을 진행합니다.
// 중복된 내용은 합치고, 금액/시간/상호명 순서로 정렬된 텍스트 레이아웃을 생성합니다.
// 들여쓰기와 공백 규정을 엄격히 준수하여 복사 후 바로 사용하기 좋은 가독성을 제공합니다.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const images = formData.getAll('images') as File[];
    
    const imageParts = await Promise.all(images.map(async (img) => ({
      inlineData: { data: Buffer.from(await img.arrayBuffer()).toString("base64"), mimeType: img.type }
    })));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      영수증 또는 스크린샷 사진을 분석해서 아래 형식으로만 출력해.
      여러 장일 경우 중복 내용은 하나로 합쳐.

      [일반 영수증]
      금액 (단위 포함)
      시간 (YYYY-MM-DD HH:mm)
      - 상호명 (전화번호)
      주소: 주소지
      기타 정보: 결제수단 등

      [배달/쇼핑 스샷]
      총 정산금액 / 배송비 (0원이면 '무료')
      할인 내역 (한 줄씩 상세히)
      구매 날짜 + 시간
      - 상호명 (전화번호)
      상품제목명
        상품옵션내용 (한 칸 들여쓰기)
      
      기타 정보: 주문번호 등
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    return NextResponse.json({ text: result.response.text() });
  } catch (e) { return NextResponse.json({ text: "🚨 분석 실패" }, { status: 500 }); }
}
// 밑에 3줄
// 텍스트 기반의 프롬프트 엔지니어링을 통해 불필요한 서술형 답변을 완전히 배제했습니다.
// 배달 앱 스크린샷 특유의 할인 내역 및 배송비 무료 처리 로직이 포함되어 있습니다.
// 이미지 전송 실패나 API 오류 시 사용자에게 명확한 에러 메시지를 전달합니다.
