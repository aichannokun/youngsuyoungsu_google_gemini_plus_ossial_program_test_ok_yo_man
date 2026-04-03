// 위에 3줄
// 100dvh로 세로 스크롤을 방지하고, 다중 파일 선택(multiple)과 이어붙이기 기능을 구현했습니다.
// 알록달록한 아이콘 대신 단순한 백색 선형 아이콘과 무채색 톤을 적용했습니다.
// 복사 성공 시 상단에 2초간 툴팁이 나타나며 자동으로 초기화됩니다.
'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const analyze = async () => {
    if (files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(res.ok ? data.text : "🚨 분석 실패");
    } catch { setResult("🚨 오류 발생"); }
    setLoading(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setShowTooltip(true);
    setTimeout(() => { setShowTooltip(false); setResult(''); setFiles([]); }, 2000);
  };

  return (
    <main style={{ backgroundColor: '#000', height: '100dvh', display: 'flex', flexDirection: 'column', padding: '20px', gap: '15px', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      {showTooltip && <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', padding: '12px 24px', borderRadius: '20px', fontSize: '14px', zIndex: 10, border: '1px solid #555' }}>복사 완료 ✅</div>}

      {!loading && !result && (
        <>
          <label style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #333', borderRadius: '30px', cursor: 'pointer' }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ marginTop: '10px', fontSize: '14px', color: '#888' }}>{files.length > 0 ? `${files.length}장 선택됨` : '사진 추가'}</span>
            <input type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
          </label>
          {files.length > 0 && (
            <button onClick={analyze} style={{ flex: 1, backgroundColor: '#fff', color: '#000', borderRadius: '30px', fontWeight: '900', fontSize: '20px', border: 'none' }}>분석 시작</button>
          )}
        </>
      )}

      {loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {result && (
        <button onClick={copyResult} style={{ flex: 1, backgroundColor: '#111', border: '1px solid #333', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="50" height="50" fill="none" stroke="#fff" strokeWidth="1.2" viewBox="0 0 24 24"><path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.501-4.474 1.125 1.125 0 011.66-.134 1.34 1.34 0 01.342.775 6.744 6.744 0 002.395 4.61 6.759 6.759 0 013.102 5.051z"/><path d="M7.5 7.875v3c0 .621-.504 1.125-1.125 1.125H3.75m16.5 4.5c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125h-9.75a1.125 1.125 0 00-1.125 1.125v10.5c0 .621.504 1.125 1.125 1.125h9.75z"/></svg>
          <span style={{ marginTop: '15px', color: '#fff', fontWeight: 'bold' }}>결과 복사하기</span>
        </button>
      )}

      {!loading && (files.length > 0 || result) && (
        <button onClick={() => {setFiles([]); setResult('');}} style={{ color: '#555', fontSize: '12px', background: 'none', border: 'none', padding: '10px' }}>다시 찍기</button>
      )}
    </main>
  );
}
// 밑에 3줄
// 무채색 톤과 얇은 선 아이콘으로 유치함을 걷어내고 전문적인 툴의 느낌을 주었습니다.
// 버튼 클릭 시의 피드백을 툴팁으로 대체하여 사용자 흐름이 끊기지 않게 했습니다.
// iPhone 8 Plus 해상도에서 컴포넌트들이 겹치지 않도록 flex 비율을 조정했습니다.
