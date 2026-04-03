// 위에 3줄
// 100dvh와 flex-layout을 사용하여 아이폰 8P 화면에 스크롤 없이 딱 맞게 고정했습니다.
// multiple 속성이 적용된 input으로 스크린샷 여러 장을 한 번에 체크하여 업로드할 수 있습니다.
// 복사 시 상단 툴팁이 나타나며 2초 후 자동으로 모든 데이터가 초기화되어 다음 작업을 준비합니다.
'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {}, 400); // 로딩 애니메이션용
      return () => clearInterval(interval);
    }
  }, [loading]);

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
      {showTooltip && (
        <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', color: '#000', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', zIndex: 100 }}>
          복사 완료 ✅
        </div>
      )}

      {!loading && !result && (
        <>
          <label style={{ flex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #333', borderRadius: '30px', cursor: 'pointer', backgroundColor: '#0a0a0a' }}>
            <svg width="50" height="50" fill="none" stroke="#fff" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ marginTop: '15px', fontSize: '16px', color: '#666' }}>{files.length > 0 ? `${files.length}장 선택됨` : '영수증/스샷 추가'}</span>
            <input type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
          </label>
          {files.length > 0 && (
            <button onClick={analyze} style={{ height: '80px', backgroundColor: '#fff', color: '#000', borderRadius: '25px', fontWeight: '900', fontSize: '22px', border: 'none' }}>분석 시작</button>
          )}
        </>
      )}

      {loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '20px', color: '#888' }}>데이터 분석 중...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {result && (
        <button onClick={copyResult} style={{ flex: 1, backgroundColor: '#000', border: '1px solid #333', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="60" height="60" fill="none" stroke="#fff" strokeWidth="1" viewBox="0 0 24 24"><path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.501-4.474 1.125 1.125 0 011.66-.134 1.34 1.34 0 01.342.775 6.744 6.744 0 002.395 4.61 6.759 6.759 0 013.102 5.051z"/><path d="M7.5 7.875v3c0 .621-.504 1.125-1.125 1.125H3.75m16.5 4.5c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125h-9.75a1.125 1.125 0 00-1.125 1.125v10.5c0 .621.504 1.125 1.125 1.125h9.75z"/></svg>
          <span style={{ marginTop: '20px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>결과 복사하기</span>
        </button>
      )}

      {!loading && (files.length > 0 || result) && (
        <button onClick={() => {setFiles([]); setResult('');}} style={{ color: '#444', fontSize: '12px', background: 'none', border: 'none', paddingBottom: '10px' }}>전체 초기화</button>
      )}
    </main>
  );
}
// 밑에 3줄
// 무채색 톤과 화이트 아이콘을 배치하여 '전문적인 도구' 느낌의 미니멀한 UI를 완성했습니다.
// 모든 버튼과 레이블은 flex 비율을 통해 iPhone 8P의 16:9 화면비 내에서 스크롤 없이 배치됩니다.
// 분석 후 복사 버튼을 누르는 즉시 초기화되어 연속적인 영수증 처리에 최적화되어 있습니다.
