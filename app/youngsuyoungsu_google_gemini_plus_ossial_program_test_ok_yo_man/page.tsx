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
    <main className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-900 text-white font-sans">
      <h1 className="mt-8 text-xl font-bold text-blue-500 opacity-50">RECEIPT SCAN</h1>
      
      {/* 카메라/앨범 통합 버튼 (더 크게) */}
      <label className="mt-10 w-full max-w-sm h-52 flex flex-col items-center justify-center border-4 border-dashed border-blue-600 rounded-[2.5rem] cursor-pointer active:scale-95 active:bg-blue-900/20 transition-all shadow-2xl">
        <span className="text-7xl mb-4">📸</span>
        <span className="text-xl font-black">영수증 가져오기</span>
        {/* capture="environment" 제거 -> 앨범 선택 가능해짐 */}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>

      {loading && <div className="mt-12 flex flex-col items-center animate-pulse">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-blue-400">분석 중...</p>
      </div>}

      {result && (
        <div className="mt-10 w-full max-w-sm flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-6">
          {/* 복사 버튼 (아이폰 8P 맞춤 왕버튼) */}
          <button 
            onClick={() => copy(result)} 
            className="w-full py-8 bg-blue-600 rounded-3xl text-2xl font-black shadow-xl active:bg-blue-700 active:scale-95 transition-all"
          >
            📋 결과 복사하기
          </button>

          <div className="p-6 bg-black/60 rounded-3xl border border-blue-900 font-mono text-lg leading-relaxed whitespace-pre-wrap shadow-inner">
            {result}
          </div>
        </div>
      )}

      {error && (
        <button onClick={() => copy("내 영수증 앱 404 에러나는데 모델 리스트 다시 뽑아줘.")} className="mt-10 text-sm text-gray-500 underline py-4 px-8">
          🚨 에러 해결 질문 복사
        </button>
      )}
    </main>
  );
}
