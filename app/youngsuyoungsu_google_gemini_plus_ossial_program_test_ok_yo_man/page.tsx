'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');

  // 분석 중 '...' 움직임 처리
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
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
    setResult(res.ok ? data.text : "🚨 업데이트 필요 (클릭)");
    setLoading(false);
  };

  const copy = (txt: string) => {
    if (txt.includes("업데이트")) {
      navigator.clipboard.writeText("내 영수증 앱 404 에러나는데 모델 리스트 다시 뽑아줘.");
      alert("에러 해결 질문이 복사되었습니다!");
    } else {
      navigator.clipboard.writeText(txt);
      alert("복사 완료! ✅");
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6 gap-6">
      {/* 1. 영수증 가져오기 (대문짝 크기) */}
      {!loading && !result && (
        <label className="w-full h-[60vh] flex flex-col items-center justify-center bg-blue-600 rounded-[3rem] shadow-2xl active:scale-95 transition-transform cursor-pointer border-8 border-blue-400">
          <span className="text-[10rem]">📸</span>
          <span className="text-5xl font-black mt-4">영수증 가져오기</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      )}

      {/* 2. 분석 중 애니메이션 */}
      {loading && (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-gray-800 rounded-[3rem] border-8 border-gray-700">
          <div className="w-32 h-32 border-[12px] border-blue-500 border-t-transparent rounded-full animate-spin mb-10"></div>
          <p className="text-6xl font-black text-blue-400">분석 중{dots}</p>
          <p className="text-2xl mt-4 text-gray-500 italic">잠시만 기다려주세요</p>
        </div>
      )}

      {/* 3. 분석 내용 & 복사하기 */}
      {result && (
        <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
          <div className="text-center py-4 bg-gray-800 rounded-2xl border-2 border-gray-700">
            <h2 className="text-3xl font-black text-gray-400">📄 분석 내용</h2>
          </div>
          
          <div className="p-8 bg-black rounded-[2.5rem] border-4 border-blue-900 shadow-inner">
            <p className="text-3xl font-mono leading-relaxed whitespace-pre-wrap break-all">
              {result}
            </p>
          </div>

          <button 
            onClick={() => copy(result)} 
            className="w-full py-16 bg-green-600 rounded-[3rem] text-6xl font-black shadow-2xl active:bg-green-700 active:scale-95 transition-all border-8 border-green-400"
          >
            복사하기
          </button>

          <button onClick={() => {setResult(''); setLoading(false);}} className="text-2xl text-gray-500 underline py-4">
            다시 찍기
          </button>
        </div>
      )}
    </main>
  );
}
