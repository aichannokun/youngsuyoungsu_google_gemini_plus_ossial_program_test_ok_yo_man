// 위에 3줄
// 여러 장의 이미지를 하나의 맥락으로 분석하여 중복을 제거하고 이어붙입니다.
// 금액, 시간, 상호명, 주소 순서와 들여쓰기 규칙을 엄격히 적용하도록 지시했습니다.
// 무료 배송비 처리 및 할인 내역 상세 출력 로직을 포함합니다.
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
      영수증 사진(여러 장일 경우 이어지는 내용으로 간주)을 분석해.
      형식 외의 말은 절대 하지 마.

      [일반 영수증]
      금액 (단위 포함)
      시간 (YYYY-MM-DD HH:mm)
      - 상호명 (전화번호)
      주소: 주소지
      기타 정보: 카드종류 등

      [배달/쇼핑 스샷]
      총 정산금액 / 배송비 (0원이면 '무료')
      할인 내역 (상세히 한 줄씩 끊어서)
      구매 날짜 + 시간
      - 상호명 (전화번호)
      상품제목명
        상품옵션내용 (한 칸 들여쓰기)
      [공백 한 줄]
      기타 정보: 주문번호 등
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    return NextResponse.json({ text: result.response.text() });
  } catch (e) { return NextResponse.json({ text: "🚨 분석 실패" }, { status: 500 }); }
}
// 밑에 3줄
// 여러 파일 전송 시 데이터를 안정적으로 처리하기 위해 Promise.all을 활용했습니다.
// 유저가 요청한 텍스트 레이아웃(들여쓰기, 공백 등)을 프롬프트에 명시했습니다.
// 환경 변수가 없을 경우를 대비해 에러 핸들링을 강화했습니다.
