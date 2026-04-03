'use client';
import { useState } from 'react';

export default function Home() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true); setResult(''); setError(false);
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/analyze', { method: 'POST', body: formData });
    const data = await res.json();
    
    if (res.ok) { setResult(data.text); } 
    else { setResult("🚨 업데이트 필요"); setError(true); }
    setLoading(false);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    if (!error) alert("복사 완료! ✅");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-900 text-white">
      <label className="w-24 h-24 flex items-center justify-center bg-blue-600 rounded-full cursor-pointer text-4xl shadow-lg active:scale-95">
        📷 <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
      </label>

      {loading && <p className="mt-4 animate-pulse">분석 중...</p>}

      {result && (
        <div className="mt-6 w-full max-w-sm">
          <div className="p-4 bg-black/40 rounded-xl border border-blue-900 font-mono text-sm whitespace-pre-wrap mb-4">
            {result}
          </div>
          <button onClick={() => copy(result)} className="w-full py-3 bg-blue-600 rounded-xl font-bold">📋 결과 복사</button>
        </div>
      )}

      {error && (
        <button 
          onClick={() => copy("내 영수증 앱 404 에러나는데 모델 리스트 다시 뽑아줘.")}
          className="mt-4 text-xs text-gray-500 underline"
        >
          🚨 에러 해결 질문 복사
        </button>
      )}
    </main>
  );
}
