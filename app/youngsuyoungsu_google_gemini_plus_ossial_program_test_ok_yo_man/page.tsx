'use client';
import { useState } from 'react';

export default function Home() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false); // 복사 상태 추가

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult('');
    setCopied(false);
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/analyze', { method: 'POST', body: formData });
    const data = await res.json();
    
    if (res.ok) {
      setResult(data.text);
    } else {
      setResult(`에러: ${data.error}`);
    }
    setLoading(false);
  };

  // 클립보드 복사 함수
  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      // 2초 뒤에 다시 버튼 텍스트 복구
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white font-sans">
      <h1 className="text-2xl font-bold mb-8 text-blue-400">⚡ 영수증 스캐너</h1>
      
      <label className="w-full max-w-xs h-48 flex flex-col items-center justify-center border-4 border-dashed border-blue-500 rounded-3xl cursor-pointer active:bg-blue-900/20 transition-all">
        <span className="text-5xl mb-2">📷</span>
        <span className="text-lg font-bold">촬영 / 업로드</span>
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
      </label>

      {loading && <p className="mt-8 animate-bounce text-blue-300">분석 중... 🍲</p>}

      {result && (
        <div className="mt-8 w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
          {/* 복사 버튼: 상태에 따라 색상과 텍스트 변경 */}
          <button 
            onClick={copyToClipboard}
            className={`w-full mb-3 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
              copied ? 'bg-green-600 scale-95' : 'bg-blue-600 active:scale-95'
            }`}
          >
            {copied ? '✅ 복사 완료!' : '📋 카톡용 결과 복사하기'}
          </button>
          
          <div className="p-5 bg-black/40 rounded-2xl border border-blue-900/50 shadow-inner overflow-x-auto">
            <p className="text-left font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {result}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
