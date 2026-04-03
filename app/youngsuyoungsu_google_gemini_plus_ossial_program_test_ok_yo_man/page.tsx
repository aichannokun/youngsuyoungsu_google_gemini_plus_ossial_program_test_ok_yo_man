// 위에 3줄
// 아이폰 8P 및 모바일 환경에서 '눈이 침침해도 보일 정도'의 초거대 UI를 적용한 코드입니다.
// 버튼 크기를 극대화하고 폰트 사이즈를 일반 웹의 4~5배 수준으로 키웠습니다.
'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 400);
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
    setResult(res.ok ? data.text : "🚨 서버 에러\n(Gemini 호출 필요)");
    setLoading(false);
  };

  const copy = (txt: string) => {
    if (txt.includes("에러")) {
      navigator.clipboard.writeText("내 영수증 앱 404 에러나는데 모델 리스트 다시 뽑아줘.");
      alert("에러 해결 질문 복사됨!");
    } else {
      navigator.clipboard.writeText(txt);
      alert("복사 완료! ✅");
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-black text-white p-4">
      {/* 1. 영수증 가져오기 (화면의 80%를 차지하는 버튼) */}
      {!loading && !result && (
        <label className="flex-1 flex flex-col items-center justify-center bg-blue-600 rounded-[50px] border-[15px] border-blue-400 active:bg-blue-800 active:scale-95 transition-all">
          <span className="text-[150px] mb-10">📸</span>
          <span className="text-[60px] font-black leading-tight text-center">
            영수증<br/>가져오기
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      )}

      {/* 2. 분석 중 (압도적 존재감) */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 rounded-[50px] border-[15px] border-gray-700">
          <div className="w-40 h-40 border-[20px] border-blue-500 border-t-transparent rounded-full animate-spin mb-20"></div>
          <p className="text-[70px] font-black text-blue-400">분석 중{dots}</p>
        </div>
      )}

      {/* 3. 분석 완료 (시원시원한 폰트와 복사 버튼) */}
      {result && (
        <div className="flex flex-col h-full gap-6 animate-in zoom-in duration-200">
          <div className="bg-gray-800 p-10 rounded-[40px] border-4 border-blue-900 shadow-inner">
            <h2 className="text-4xl font-bold text-gray-500 mb-6 underline">분석 내용</h2>
            <p className="text-[50px] font-mono leading-[1.3] whitespace-pre-wrap break-all font-black text-yellow-400">
              {result}
            </p>
          </div>

          <button 
            onClick={() => copy(result)} 
            className="w-full py-16 bg-green-600 rounded-[50px] text-[80px] font-black border-[15px] border-green-400 active:bg-green-800 active:scale-90 transition-all shadow-2xl"
          >
            복사하기
          </button>

          <button 
            onClick={() => {setResult(''); setLoading(false);}} 
            className="w-full py-8 text-4xl text-gray-500 font-bold"
          >
            뒤로가기 (처음부터)
          </button>
        </div>
      )}
    </main>
  );
}
// 밑에 3줄
// 폰트 사이즈를 text-[80px] 등으로 극단적으로 키워 아이폰 8P에서 버튼 하나가 화면을 꽉 채우게 했습니다.
// 복사 버튼은 초록색 왕버튼으로 만들어 한 눈에 들어오게 설계했습니다.
// 텍스트 간격(leading)과 여백을 넓혀서 터치 실수가 없도록 했습니다.
