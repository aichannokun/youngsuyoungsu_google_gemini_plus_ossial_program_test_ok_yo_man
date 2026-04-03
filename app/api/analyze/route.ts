import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // 1. API 키가 없으면 바로 알려줌
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ text: "🚨 API 키가 설정되지 않았습니다. Vercel 환경변수를 확인하세요." }, { status: 500 });
    }

    const formData = await req.formData();
    const images = formData.getAll('images') as File[];

    if (images.length === 0) {
      return NextResponse.json({ text: "🚨 이미지가 전송되지 않았습니다." }, { status: 400 });
    }

    // 2. 이미지 변환 과정 안정화
    const imageParts = await Promise.all(images.map(async (img) => {
      const arrayBuffer = await img.arrayBuffer();
      return {
        inlineData: {
          data: Buffer.from(arrayBuffer).toString("base64"),
          mimeType: img.type
        }
      };
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      영수증 사진(여러 장일 경우 이어지는 내용)을 분석해서 아래 형식으로만 출력해.
      중복되는 내용은 하나로 합치고, 불필요한 설명 없이 텍스트만 출력해.

      [일반 영수증일 경우]
      금액
      시간
      - 상호명 (전화번호)
      주소: ㅇㅇㅇ
      기타 정보: ㅁㅁㅁ

      [배달/쇼핑 스크린샷일 경우]
      총 정산금액 / 배송비(0원이면 '무료')
      할인 내역(한 줄씩 끊어서 상세히)
      구매 날짜 + 시간
      - 상호명 (전화번호)
      상품제목명
        상품옵션내용 (들여쓰기)
      기타 정보: ㅁㅁㅁ
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return NextResponse.json({ text: response.text() });

  } catch (e: any) {
    console.error("Gemini Error:", e);
    // 3. 에러 내용을 구체적으로 리턴해서 화면에서 볼 수 있게 함
    return NextResponse.json({ text: `🚨 에러: ${e.message}` }, { status: 500 });
  }
}
