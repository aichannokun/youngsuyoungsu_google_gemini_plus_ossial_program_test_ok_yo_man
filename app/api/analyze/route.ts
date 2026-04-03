// 위에 3줄
// API 키 누락이나 제미나이 모델 호출 오류를 상세하게 잡아내도록 로직을 보강했습니다.
// 여러 장의 이미지를 처리할 때 발생하는 잠재적인 비동기 오류를 방지하기 위해 구조를 개선했습니다.
// 에러 발생 시 단순 문구가 아닌 구체적인 시스템 메시지를 리턴하여 디버깅을 돕습니다.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "") {
      return NextResponse.json({ text: "🚨 API 키가 설정되지 않았습니다. Vercel 환경변수를 확인하세요." }, { status: 500 });
    }

    const formData = await req.formData();
    const images = formData.getAll('images') as File[];
    
    if (images.length === 0) return NextResponse.json({ text: "🚨 전송된 이미지가 없습니다." }, { status: 400 });

    const imageParts = await Promise.all(images.map(async (img) => {
      const bytes = await img.arrayBuffer();
      return {
        inlineData: { data: Buffer.from(bytes).toString("base64"), mimeType: img.type || "image/jpeg" }
      };
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "영수증/스크린샷을 분석해서 금액, 시간, 상호명 순으로 정리해. 상세 내역도 포함해.";

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();

    if (!text) return NextResponse.json({ text: "🚨 제미나이가 빈 답변을 보냈습니다." }, { status: 500 });
    
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error("Gemini Error:", e);
    return NextResponse.json({ text: `🚨 서버 에러: ${e.message}` }, { status: 500 });
  }
}
// 밑에 3줄
// 이제 API 키가 비어있으면 화면에 즉시 경고가 뜹니다.
// 이미지 MIME 타입을 유동적으로 처리하여 스크린샷과 일반 사진 모두 대응 가능합니다.
// catch 블록에서 에러 메시지(e.message)를 직접 전달하여 원인 파악이 빨라집니다.
