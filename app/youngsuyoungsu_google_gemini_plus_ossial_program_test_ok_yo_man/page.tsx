'use client';
import { useState, useEffect } from 'react';

// 이미지 압축 함수 (품질 0.8 / 최대 1500px)
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxSize = 1500;
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = (height / width) * maxSize; width = maxSize; }
        else { width = (width / height) * maxSize; height = maxSize; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file);
      }, 'image/jpeg', 0.75);
    };
    img.src = url;
  });
}

const statusMessages = [
  '분석 중...',
  '잠시 대기 중...',
  '재시도 중...',
  '조금만 더 기다려주세요...',
];

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!loading) { setStatusIdx(0); return; }
    const interval = setInterval(() => {
      setStatusIdx(prev => Math.min(prev + 1, statusMessages.length - 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      setFiles(prev => [...prev, ...Array.from(selected)]);
    }
  };

  const analyze = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setStatusIdx(0);
    try {
      const compressed = await Promise.all(files.map(compressImage));
      const formData = new FormData();
      compressed.forEach(f => formData.append('images', f));
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(res.ok ? data.text : '🚨 분석 실패');
    } catch { setResult('🚨 오류 발생'); }
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
            <input type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
          </label>
          {files.length > 0 && (
            <button onClick={analyze} style={{ height: '80px', backgroundColor: '#fff', color: '#000', borderRadius: '25px', fontWeight: '900', fontSize: '22px', border: 'none' }}>{files.length}장 분석 시작</button>
          )}
        </>
      )}

      {loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ color: '#888', fontSize: '14px' }}>{statusMessages[statusIdx]}</span>
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
        <button onClick={() => { setFiles([]); setResult(''); }} style={{ color: '#444', fontSize: '12px', background: 'none', border: 'none', paddingBottom: '10px' }}>전체 초기화</button>
      )}
    </main>
  );
}
