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

    // 최대 5회 자동 재시도 로직 (503 에러 대응)
    for (let i = 1; i <= 5; i++) {
      setRetryCount(i);
      try {
        const res = await fetch('/api/analyze', { method: 'POST', body: formData });
        const data = await res.json();

        if (res.ok) {
          setResult(data.text);
          setLoading(false);
          return;
        }

        // 모델 만료(404) 시 즉시 중단 및 안내
        if (res.status === 404) {
          setResult("🚨 [업데이트 필요] AI 모델 버전이 교체되었습니다. 라우트 파일의 모델명을 수정해 주세요.");
          setLoading(false);
          return;
        }

        // 서버 과부하(503) 시 2초 대기 후 재시도
        if (res.status === 503 && i < 5) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        if (i === 5) setResult(`❌ 분석 실패 (5회 시도): 현재 사용자가 많습니다. 잠시 후 다시 시도해 주세요.\n(${data.error})`);
      } catch (err) {
        if (i === 5) setResult("❌ 네트워크 오류가 발생했습니다.");
      }
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-8 text-blue-400">⚡ 영수증 스캐너</h1>
      
      {/* 폰에서 누르면 바로 카메라가 뜨는 버튼 */}
      <label className="w-full max-w-xs h-64 flex flex-col items-center justify-center border-4 border-dashed border-blue-500 rounded-3xl cursor-pointer hover:bg-blue-900/20 transition-all active:scale-95">
        <span className="text-6xl mb-4">📷</span>
        <span className="text-lg font-bold">영수증 촬영하기</span>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleUpload} 
        />
      </label>

      {loading && (
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-300 font-medium">{retryCount}번째 분석 시도 중...</p>
        </div>
      )}

      {result && (
        <div className="mt-8 p-6 bg-black/50 rounded-2xl border border-blue-900 w-full max-w-md shadow-2xl overflow-x-auto">
          {/* whitespace-pre-wrap으로 탭(공백)과 줄바꿈을 완벽히 보존 */}
          <p className="text-left font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {result}
          </p>
        </div>
      )}
    </main>
  );
}
