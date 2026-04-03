'use client';
import { useState } from 'react';

export default function Home() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/analyze', { method: 'POST', body: formData });
    const data = await res.json();
    setResult(data.text || data.error);
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-8">⚡ 영수증 스캐너</h1>
      
      {/* 사진 찍기 버튼 (모바일 최적화) */}
      <label className="w-full max-w-xs h-64 flex flex-col items-center justify-center border-4 border-dashed border-blue-500 rounded-2xl cursor-pointer hover:bg-blue-900/30 transition-all">
        <span className="text-5xl mb-4">📷</span>
        <span className="text-lg font-semibold">영수증 촬영 / 업로드</span>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" // 폰에서 바로 카메라를 띄우는 마법의 속성
          className="hidden" 
          onChange={handleUpload}
        />
      </label>

      {loading && <p className="mt-8 animate-pulse text-blue-400 font-bold text-xl">탕탕집 찾는 중... 🍲</p>}

      {result && (
        <div className="mt-8 p-6 bg-gray-800 rounded-xl border border-blue-500 w-full max-w-md shadow-2xl">
          <p className="text-center font-mono text-lg break-words">{result}</p>
        </div>
      )}
    </main>
  );
}
