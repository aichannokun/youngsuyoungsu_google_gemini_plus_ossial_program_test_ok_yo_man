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
      setFiles(prev => [...prev, ...Array.from(selected)]);
    }
  };

  const analyze = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setResult(''); // 이전 결과 초기화
    
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      
      // 서버에서 보낸 상세 에러 메시지가 있다면 그걸 보여주고, 없으면 기본 문구 출력
      if (!res.ok) {
        setResult(data.text || "🚨 분석 실패 (서버 오류)");
      } else {
        setResult(data.text);
      }
    } catch (e) {
      setResult("🚨 네트워크 연결 오류 (용량이 너무 클 수 있습니다)");
    }
    setLoading(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setShowTooltip(true);
    setTimeout(() => { 
      setShowTooltip(false); 
      setResult(''); 
      setFiles([]); 
    }, 2000);
  };

  return (
    <main style={{ backgroundColor: '#000', height: '100dvh', display: 'flex', flexDirection: 'column', padding: '20px', gap: '15px', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      {/* 복사 완료 알림 툴팁 */}
      {showTooltip && (
        <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', color: '#000', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', zIndex: 100 }}>
          복사 완료 ✅
        </div>
      )}

      {/* 1. 대기 상태: 사진 추가 및 분석 시작 버튼 */}
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

      {/* 2. 로딩 상태 */}
      {loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '20px', color: '#888' }}>데이터 분석 중...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* 3. 분석 결과 또는 에러 표시 상태 */}
      {result && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={copyResult} style={{ flex: 5, backgroundColor: '#000', border: '1px solid #333', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {result.startsWith('🚨') ? (
              <span style={{ color: '#ff4d4d', padding: '20px', textAlign: 'center' }}>{result}</span>
            ) : (
              <>
                <svg width="60" height="60" fill="none" stroke="#fff" strokeWidth="1" viewBox="0 0 24 24"><path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.501-4.474 1.125 1.125 0 011.66-.134 1.34 1.34 0 01.342.775 6.744 6.744 0 002.395 4.61 6.759 6.759 0 013.102 5.051z"/><path d="M7.5 7.875v3c0 .621-.504 1.125-1.125 1.125H3.75m16.5 4.5c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125h-9.75a1.125 1.125 0 00-1.125 1.125v10.5c0 .621.504 1.125 1.125 1.125h9.75z"/></svg>
                <span style={{ marginTop: '20px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>결과 복사하기</span>
              </>
            )}
          </button>
          <button onClick={() => {setFiles([]); setResult('');}} style={{ color: '#444', fontSize: '12px', background: 'none', border: 'none', paddingBottom: '10px' }}>전체 초기화</button>
        </div>
      )}
    </main>
  );
}
