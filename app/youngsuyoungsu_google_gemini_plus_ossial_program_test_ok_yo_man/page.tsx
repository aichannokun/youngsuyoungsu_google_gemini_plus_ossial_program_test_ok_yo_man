// 파란색/초록색 버튼을 버리고, 무채색(검정색/회색) 배경에 백색 아이콘을 배치한 심플 디자인 버전입니다.
// 기존의 유동적인 반응형 UI(clamp(), flex:)는 유지하여 아이폰 8P에서 터치감은 살렸습니다.
// SVG 아이콘을 사용하여 어떤 크기에서도 깨지지 않고 선명하게 보입니다.
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

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setResult('');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(res.ok ? data.text : "🚨 에러 발생");
    } catch (e) {
      setResult("🚨 네트워크 에러");
    }
    setLoading(false);
  };

  const copyAndReset = () => {
    navigator.clipboard.writeText(result);
    alert("복사 완료! ✅");
    setResult('');
  };

  // 공통 카드 스타일: 유동적인 테두리 두께와 둥글기 적용
  const cardStyle: React.CSSProperties = {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    borderRadius: '40px', border: 'min(2vw, 8px) solid', transition: 'all 0.15s ease-in-out',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  };

  // 백색 SVG 아이콘들 (Camera, Copy)
  const IconCamera = () => <svg style={{ width: 'clamp(80px, 20vw, 150px)', height: 'clamp(80px, 20vw, 150px)' }} fill="none" stroke="#fff" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>;
  const IconCopy = () => <svg style={{ width: 'clamp(80px, 20vw, 150px)', height: 'clamp(80px, 20vw, 150px)' }} fill="none" stroke="#fff" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.501-4.474 1.125 1.125 0 011.66-.134 1.34 1.34 0 01.342.775 6.744 6.744 0 002.395 4.61 6.759 6.759 0 013.102 5.051z"/><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.875v3c0 .621-.504 1.125-1.125 1.125H3.75m16.5 4.5c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125h-9.75a1.125 1.125 0 00-1.125 1.125v10.5c0 .621.504 1.125 1.125 1.125h9.75z"/></svg>;

  return (
    <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '6vh 6vw', gap: '3vh', boxSizing: 'border-box' }}>
      
      {/* 1. 대기 상태: 짙은 회색 버튼 + 백색 카메라 아이콘 */}
      {!loading && !result && (
        <label style={{ ...cardStyle, backgroundColor: '#1f2937', borderColor: '#374151', cursor: 'pointer' }}>
          <IconCamera />
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
          <p style={{ color: '#aaa', fontSize: '18px', marginTop: '20px', fontWeight: 'bold' }}>영수증 가져오기</p>
        </label>
      )}

      {/* 2. 분석 중 상태 */}
      {loading && (
        <div style={{ ...cardStyle, backgroundColor: '#111827', borderColor: '#222' }}>
          <div style={{ width: '100px', height: '100px', border: '12px solid #555', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#fff', marginTop: '4vh' }}>분석중{dots}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* 3. 분석 완료: 거의 검정색 버튼 + 백색 복사 아이콘 */}
      {result && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3vh' }}>
          <button 
            onClick={copyAndReset} 
            style={{ ...cardStyle, flex: 6, backgroundColor: '#050505', borderColor: '#222', cursor: 'pointer', outline: 'none', borderStyle: 'solid' }}
          >
            <IconCopy />
            <p style={{ color: '#fff', fontSize: '20px', marginTop: '20px', fontWeight: '900' }}>복사하기</p>
          </button>
          
          <button 
            onClick={() => setResult('')} 
            style={{ flex: 1, color: '#666', fontSize: 'clamp(20px, 5vw, 25px)', fontWeight: '900', border: 'none', background: 'none' }}
          >
            ❌ 취소하고 다시 찍기
          </button>
        </div>
      )}
    </main>
  );
}
// clamp()를 사용해 폰트가 너무 작아지거나 커지는 것을 방지했습니다.
// padding과 margin을 유동적으로 설정해 화면 비율을 자동으로 맞춥니다.
// 복사 후 초기화 로직을 포함해 연속적인 작업이 가능하게 했습니다.
// 이 코드는 파란색/초록색 버튼을 버리고, 무채색(검정색/회색) 배경에 백색 아이콘을 배치한 심플 디자인 버전입니다.
