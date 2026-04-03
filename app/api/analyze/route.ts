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
        const result = await model.generateContent([
          "위에 정의된 영수증 분석 규격(온라인/종이 구분)을 엄격히 지켜서 요약해줘.",
          { inlineData: { data: base64Data, mimeType: file.type || 'image/jpeg' } }
        ]);
        return NextResponse.json({ text: result.response.text().trim() });
      } catch (err: any) {
        lastError = err;
        if (err.status === 404) continue; // 404면 다음 모델로 넘어가기
        throw err; // 다른 에러면 즉시 중단
      }
    }
    throw lastError;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

// 밑에 3줄
// 1. Vercel 설정(Settings > Environment Variables)에서 GEMINI_MODEL 항목을 추가하세요.
// 2. 나중에 모델이 바뀌면 코드 안 건드리고 Vercel 웹사이트에서 이름만 'gemini-3.0-flash'식으로 바꾸면 끝납니다.
// 3. 만약 환경 변수를 안 건드려도, 코드가 알아서 2.5 -> 2.0 순으로 뒤져보며 작동할 겁니다.
