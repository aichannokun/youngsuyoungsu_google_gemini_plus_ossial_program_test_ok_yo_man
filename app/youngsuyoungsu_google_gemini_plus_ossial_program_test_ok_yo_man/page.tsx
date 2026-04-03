'use client';
import { useState } from 'react';

export default function Home() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult('');
    const formData = new FormData();
    formData.append('image', file);

    // 최대 5번 재시도 로직
    for (let i = 1; i <= 5; i++) {
      setRetryCount(i);
      try {
        const res = await fetch('/api/analyze', { method: 'POST', body: formData });
        const data = await res.json();

        if (res.ok) {
          setResult(data.text);
          setLoading(false);
          return; // 성공 시 종료
        }

        // 특정 에러별 처리
        if (res.status === 404) {
          setResult("🚨 [모델 만료] 현재 설정된 AI 모델이 최신 버전으로 교체되어 라우트 파일 수정이 필요합니다.");
          setLoading(false);
          return;
        }

        if (res.status === 503 && i < 5) {
          console.log(`${i}번째 재시도 중...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기 후 재시도
          continue;
        }

        if (i === 5) {
          setResult(`❌ 5회 시도 모두 실패: 현재 사용자가 너무 많습니다. 
          잠시 후 다시 시도하거나, 에러가 지속되면 'gemini-2.0-flash' 등으로 모델명을 변경해 주세요.`);
        }
      } catch (err) {
        if (i === 5) setResult("네트워크 연결이 불안정합니다.");
      }
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-8">⚡ 영수증 스캐너</h1>
      
      <label className="w-full max-w-xs h-64 flex flex-col items-center justify-center border-4 border-dashed border-blue-500 rounded-2xl cursor-pointer hover:bg-blue-900/30 transition-all">
        <span className="text-5xl mb-4">📷</span>
        <span className="text-lg font-semibold">영수증 촬영</span>
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
      </label>

      {loading && (
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-blue-400 font-bold">{retryCount}번째 시도 중... (최대 5회)</p>
        </div>
      )}

      {result && (
        <div className="mt-8 p-6 bg-gray-800 rounded-xl border border-blue-500 w-full max-w-md">
          <p className="text-center font-mono whitespace-pre-line">{result}</p>
        </div>
      )}
    </main>
  );
}
