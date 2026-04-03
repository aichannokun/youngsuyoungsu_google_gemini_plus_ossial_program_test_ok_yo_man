'use client';
import { useState } from 'react';

export default function Home() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null); // 에러 타입 추적

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult('');
    setErrorType(null);
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/analyze', { method: 'POST', body: formData });
    const data = await res.json();
    
    if (res.ok) {
      setResult(data.text);
    } else {
      setResult(`🚨 분석 실패: ${data.error}`);
      // 모델 만료(404)나 알 수 없는 서버 에러일 경우 가이드 표시
      if (res.status === 404 || res.status === 500) setErrorType('MODEL_UPDATE');
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, isResult: boolean) => {
    navigator.clipboard.writeText(text).then(() => {
      if (isResult) setCopied(true);
      if (isResult) setTimeout(() => setCopied(false), 2000);
      else alert("질문 문구가 복사되었습니다! 그대로 Gemini에게 물어보세요. 🤖");
    });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-8 text-blue-400">⚡ 영수증 스캐너</h1>
      
      <label className="w-full max-w-xs h-40 flex flex-col items-center justify-center border-4 border-dashed border-blue-500 rounded-3xl cursor-pointer active:bg-blue-900/20">
        <span className="text-5xl mb-2">📷</span>
        <span className="text-lg font-bold">촬영 / 업로드</span>
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
      </label>

      {loading && <p className="mt-8 animate-bounce text-blue-300 font-bold text-xl">분석 중... 🍲</p>}

      {result && (
        <div className="mt-8 w-full max-w-md">
          <button 
            onClick={() => copyToClipboard(result, true)}
            className={`w-full mb-3 py-4 rounded-2xl font-bold transition-all ${copied ? 'bg-green-600' : 'bg-blue-600'}`}
          >
            {copied ? '✅ 복사 완료!' : '📋 결과 복사하기'}
          </button>
          <div className="p-5 bg-black/40 rounded-2xl border border-blue-900/50 overflow-x-auto">
            <p className="text-left font-mono text-sm whitespace-pre-wrap">{result}</p>
          </div>
        </div>
      )}

      {/* --- 비상 매뉴얼 섹션 (에러 발생 시 등장) --- */}
      {errorType === 'MODEL_UPDATE' && (
        <div className="mt-10 p-5 bg-red-900/20 border border-red-500/50 rounded-2xl w-full max-w-md animate-pulse">
          <p className="text-red-400 font-bold mb-2">🚨 모델 업데이트가 필요해 보입니다!</p>
          <p className="text-sm text-gray-300 mb-4">
            아래 문구를 복사해서 Gemini에게 전달하면 최신 모델 리스트를 알려드릴게요.
          </p>
          <button 
            onClick={() => copyToClipboard("내 영수증 앱 모델 리스트 좀 다시 뽑아줘. 지금 404 에러가 나고 있어.", false)}
            className="w-full bg-white text-black py-2 rounded-xl font-bold hover:bg-gray-200"
          >
            💬 Gemini 호출 질문 복사하기
          </button>
        </div>
      )}
    </main>
  );
}
