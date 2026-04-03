// 위에 3줄
// Vercel의 4.5MB 제한을 고려하여 에러 메시지를 구체적으로 리턴하도록 수정했습니다.
// Gemini API 호출 시 응답 속도를 위해 최신 모델 설정을 유지합니다.
// 서버 로그(Vercel Logs)에서도 상세한 에러 확인이 가능하도록 console.error를 추가했습니다.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ text: "🚨 API 키가 없습니다. Vercel 설정을 확인하세요." }, { status: 500 });
    }

    const formData = await req.formData();
    const images = formData.getAll('images') as File[];

    if (images.length === 0) {
      return NextResponse.json({ text: "🚨 이미지가 전송되지 않았습니다." }, { status: 400 });
    }

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
    const prompt = `영수증 사진을 분석해서 금액, 시간, 상호명(전화번호), 주소 순으로 정리해줘. 배달 스샷이면 할인내역과 상품명도 포함해줘.`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return NextResponse.json({ text: response.text() });

  } catch (e: any) {
    console.error("Gemini Error:", e);
    // 에러 내용을 구체적으로 리턴해서 유저가 화면에서 볼 수 있게 함
    return NextResponse.json({ text: `🚨 에러 발생: ${e.message || "알 수 없는 오류"}` }, { status: 500 });
  }
}
// 밑에 3줄
// 이제 분석 실패 시 단순 문구가 아니라 실제 원인(Payload Too Large 등)이 출력됩니다.
// 여러 장의 사진을 처리할 때 발생할 수 있는 버퍼 오류를 방지하기 위해 형변환 로직을 안정화했습니다.
// 이 코드를 적용하면 Vercel 대시보드의 'Logs' 탭에서도 상세 에러를 추적할 수 있습니다.
