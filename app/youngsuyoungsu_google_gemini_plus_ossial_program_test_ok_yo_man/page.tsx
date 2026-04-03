'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImages(prev => [...prev, file]);
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(res.ok ? data.text : "🚨 분석 실패");
    } catch (e) {
      setResult("🚨 네트워크 오류");
    }
    setLoading(false);
  };

  const resetAll = () => { setImages([]); setResult(''); };

  const cardStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    borderRadius: '30px', border: '2px solid #222', transition: 'all 0.2s', width: '100%'
  };

  return (
    <main style={{ backgroundColor: '#000', height: '100dvh', display: 'flex', flexDirection: 'column', padding: '20px', gap: '15px', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* 분석 전: 사진 추가 및 분석 시작 */}
      {!loading && !result && (
        <>
          <label style={{ ...cardStyle, flex: 3, backgroundColor: '#111' }}>
            <svg style={{ width: '60px', height: '60px' }} fill="none" stroke="#fff" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <p style={{ color: '#666', fontSize: '16px', marginTop: '10px' }}>{images.length > 0 ? `${images.length}장 선택됨` : '영수증 촬영'}</p>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAddImage} />
          </label>
          
          {images.length > 0 && (
            <button onClick={handleAnalyze} style={{ ...cardStyle, flex: 1.5, backgroundColor: '#fff', border: 'none' }}>
              <svg style={{ width: '40px', height: '40px' }} fill="none" stroke="#000" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ color: '#000', fontWeight: '900', marginTop: '5px' }}>분석 시작</span>
            </button>
          )}
          
          {images.length > 0 && (
            <button onClick={resetAll} style={{ color: '#444', fontSize: '13px', padding: '10px', background: 'none', border: 'none' }}>다시 찍기</button>
          )}
        </>
      )}

      {/* 분석 중 */}
      {loading && (
        <div style={{ ...cardStyle, flex: 1, backgroundColor: '#000' }}>
          <div style={{ width: '50px', height: '50px', border: '6px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>분석 중{dots}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* 결과 단계 */}
      {result && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={() => { navigator.clipboard.writeText(result); alert('복사됨!'); resetAll(); }}
            style={{ ...cardStyle, flex: 5, backgroundColor: '#fff', border: 'none' }}
          >
            <svg style={{ width: '80px', height: '80px' }} fill="none" stroke="#000" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.501-4.474 1.125 1.125 0 011.66-.134 1.34 1.34 0 01.342.775 6.744 6.744 0 002.395 4.61 6.759 6.759 0 013.102 5.051z"/><path d="M7.5 7.875v3c0 .621-.504 1.125-1.125 1.125H3.75m16.5 4.5c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125h-9.75a1.125 1.125 0 00-1.125 1.125v10.5c0 .621.504 1.125 1.125 1.125h9.75z"/></svg>
            <p style={{ color: '#000', fontWeight: '900', marginTop: '10px' }}>복사하고 끝내기</p>
          </button>
          <button onClick={resetAll} style={{ color: '#444', fontSize: '13px', padding: '10px', background: 'none', border: 'none' }}>다시 찍기</button>
        </div>
      )}
    </main>
  );
}
