'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setResult('');
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/analyze', { method: 'POST', body: formData });
    const data = await res.json();
    setResult(res.ok ? data.text : "🚨 에러 발생");
    setLoading(false);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    alert("복사 완료! ✅");
  };

  return (
    <main className="flex flex-col min-h-screen bg-black text-white p-6 overflow-hidden">
      {/* 1. 가져오기 버튼 (화면 절반 크기) */}
      {!loading && !result && (
        <label className="flex-1 flex flex-col items-center justify-center bg-blue-600 rounded-[60px] border-[20px] border-blue-400 active:scale-90 transition-all">
          <span className="text-[30vw]">📸</span>
          <span className="text-[12vw] font-black leading-none mt-4 text-center">가져오기</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      )}

      {/* 2. 로딩창 */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 rounded-[60px] border-[20px] border-gray-700">
          <div className="w-[30vw] h-[30vw] border-[5vw] border-blue-500 border-t-transparent rounded-full animate-spin mb-10"></div>
          <p className="text-[10vw] font-black text-blue-400">분석중{dots}</p>
        </div>
      )}

      {/* 3. 분석 결과 & 복사 */}
      {result && (
        <div className="flex flex-col h-full gap-8 animate-in zoom-in duration-300">
          <div className="bg-gray-800 p-8 rounded-[40px] border-4 border-blue-900">
            <p className="text-[9vw] font-mono leading-tight font-black text-yellow-400 whitespace-pre-wrap">
              {result}
            </p>
          </div>

          <button 
            onClick={() => copy(result)} 
            className="w-full py-16 bg-green-600 rounded-[60px] text-[15vw] font-black border-[15px] border-green-400 active:scale-95 transition-all"
          >
            복사하기
          </button>

          <button onClick={() => setResult('')} className="text-4xl text-gray-500 font-bold py-6">
            뒤로가기
          </button>
        </div>
      )}
    </main>
  );
}


