'use client';
import { useState } from 'react';

export default function ReceiptScanner() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return alert('사진을 선택해주세요!');
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      // 백엔드에서 보낸 'text' 필드를 정확히 읽어옵니다.
      setResult(data.text || data.error || '결과를 읽을 수 없습니다.');
    } catch (err) {
      setResult('서버 연결 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '20px' }}>🧾 영수증 스캐너</h2>
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} style={{ marginBottom: '20px' }} />
      <button onClick={handleUpload} disabled={loading} style={{ width: '100%', padding: '15px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>
        {loading ? '분석 중...' : '영수증 분석하기'}
      </button>
      {result && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px', wordBreak: 'break-all' }}>
          <strong>[분석 결과]</strong><br />{result}
        </div>
      )}
    </div>
  );
}
