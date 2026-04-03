import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. 서버에 키가 있는지부터 확인
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Vercel 환경변수에 GEMINI_API_KEY가 없습니다.");
      return NextResponse.json({ text: "🚨 에러: 서버에 API 키가 설정되지 않았습니다. Vercel Settings를 확인하세요." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const formData = await req.formData();
    const images = formData.getAll('images') as File[];

    if (images.length === 0) {
      return NextResponse.json({ text: "🚨 사진이 전송되지 않았습니다." }, { status: 400 });
    }

    const imageParts = await Promise.all(images.map(async (img) => ({
      inlineData: { 
        data: Buffer.from(await img.arrayBuffer()).toString("base64"), 
        mimeType: img.type || "image/jpeg" 
      }
    })));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "영수증을 분석해서 금액, 시간, 상호명 순으로 정리해줘.";

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();

    return NextResponse.json({ text });

  } catch (e: any) {
    console.error("Gemini Runtime Error:", e.message);
    // 2. 구체적인 에러 메시지를 화면에 띄움 (예: API 키가 잘못됨, 타임아웃 등)
    return NextResponse.json({ text: `🚨 연결 실패: ${e.message}` }, { status: 500 });
  }
}
