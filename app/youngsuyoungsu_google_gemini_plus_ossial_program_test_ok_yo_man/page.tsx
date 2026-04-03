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

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setResult('');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(res.ok ? data.text : "🚨 에러 발생\nGemini 호출 필요");
    } catch (e) {
      setResult("🚨 네트워크 에러");
    }
    setLoading(false);
  };

  const copy = (txt) => {
    navigator.clipboard.writeText(txt);
    alert("복사 완료! ✅");
  };

  return (
    <main style={{ backgroundColor: 'black', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      
      {!loading && !result && (
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', borderRadius: '50px', border: '15px solid #60a5fa', cursor: 'pointer' }}>
          <span style={{ fontSize: '150px' }}>📸</span>
          <span style={{ fontSize: '60px', fontWeight: '900', color: 'white', textAlign: 'center' }}>영수증<br/>가져오기</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      )}

      {loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', borderRadius: '50px', border: '15px solid #374151' }}>
          <div style={{ width: '100px', height: '100px', border: '15px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ fontSize: '60px', fontWeight: '900', color: '#60a5fa', marginTop: '40px' }}>분석중{dots}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#1f2937', padding: '30px', borderRadius: '40px', border: '4px solid #1e3a8a' }}>
            <p style={{ fontSize: '45px', fontWeight: '900', color: '#facc15', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
              {result}
            </p>
          </div>

          <button 
            onClick={() => copy(result)} 
            style={{ width: '100%', padding: '60px 0', backgroundColor: '#16a34a', borderRadius: '50px', fontSize: '70px', fontWeight: '900', color: 'white', border: '15px solid #4ade80' }}
          >
            복사하기
          </button>

          <button onClick={() => setResult('')} style={{ color: '#6b7280', fontSize: '30px', fontWeight: 'bold', padding: '20px', border: 'none', background: 'none' }}>
            뒤로가기
          </button>
        </div>
      )}
    </main>
  );
}
