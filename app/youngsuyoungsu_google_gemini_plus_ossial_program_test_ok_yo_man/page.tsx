// 위에 3줄
// multiple 속성을 확실히 부여하여 앨범에서 여러 장을 '체크'한 뒤 한꺼번에 가져오도록 설정했습니다.
// 기존에 선택된 파일들이 있다면 그 뒤에 새로 선택한 파일들이 합쳐지도록 로직을 보강했습니다.
// 아이폰 8P 환경에서 사진 선택 시 '추가' 버튼을 눌러야 한꺼번에 넘어가는 점을 고려했습니다.
'use client';
import { useState } from 'react';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      // 뭉텅이로 들어온 파일들을 기존 목록에 합체!
      setFiles(prev => [...prev, ...Array.from(selected)]);
    }
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
      {showTooltip && <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', color: '#000', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', zIndex: 100 }}>복사 완료 ✅</div>}

      {!loading && !result && (
        <>
          <label style={{ flex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #333', borderRadius: '30px', cursor: 'pointer', backgroundColor: '#0a0a0a' }}>
            <svg width="50" height="50" fill="none" stroke="#fff" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ marginTop: '15px', fontSize: '16px', color: '#666' }}>{files.length > 0 ? `${files.length}장 대기 중...` : '사진 뭉텅이로 추가'}</span>
            <input 
              type="file" 
              multiple           /* 👈 이게 범인입니다. 확실히 박아넣었습니다! */
              accept="image/*" 
              onChange={handleFiles} 
              style={{ display: 'none' }} 
            />
          </label>
          {files.length > 0 && (
            <button onClick={analyze} style={{ height: '80px', backgroundColor: '#fff', color: '#000', borderRadius: '25px', fontWeight: '900', fontSize: '22px', border: 'none' }}>{files.length}장 분석 시작</button>
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
        <button onClick={copyResult} style={{ flex: 1, backgroundColor: '#000', border: '1px solid #333', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
// input 태그에 multiple 속성이 명시되어 있어, 이제 앨범에서 여러 장을 콕콕 찍어 한 번에 올릴 수 있습니다.
// 스택(Stack) 방식으로 파일을 쌓아주기 때문에, 한 번에 다 못 골랐더라도 다시 눌러서 추가하면 됩니다.
// iPhone 환경에서 선택창이 바로 닫히지 않도록 표준 필터(accept="image/*")를 적용했습니다.
