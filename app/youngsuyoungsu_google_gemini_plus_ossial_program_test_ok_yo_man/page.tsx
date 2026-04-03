// 위에 3줄
// 서버에서 전달받은 상세 에러 메시지를 사용자 화면에 가공 없이 노출하여 즉각적인 피드백을 제공합니다.
// 100dvh와 무채색 룩앤필을 유지하면서 텍스트 영역의 가독성을 높였습니다.
// 분석 결과가 에러 메시지일 경우 붉은색으로 강조하여 직관성을 높였습니다.
'use client';
import { useState } from 'react';

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
    setLoading(true); setResult('');
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data.text || "🚨 원인 불명의 실패");
    } catch (e) { setResult("🚨 연결 오류"); }
    setLoading(false);
  };

  const copyResult = () => {
    if (result.startsWith('🚨')) return; // 에러는 복사 안함
    navigator.clipboard.writeText(result);
    setShowTooltip(true);
    setTimeout(() => { setShowTooltip(false); setResult(''); setFiles([]); }, 2000);
  };

  return (
    <main style={{ backgroundColor: '#000', height: '100dvh', display: 'flex', flexDirection: 'column', padding: '20px', gap: '15px', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      {showTooltip && <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', color: '#000', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', zIndex: 100 }}>복사 완료 ✅</div>}

      {!loading && !result && (
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #333', borderRadius: '30px', cursor: 'pointer', backgroundColor: '#0a0a0a' }}>
          <svg width="50" height="50" fill="none" stroke="#fff" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ marginTop: '15px', color: '#666' }}>{files.length > 0 ? `${files.length}장 선택됨` : '영수증/스샷 추가'}</span>
          <input type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
          {files.length > 0 && <button onClick={(e) => { e.preventDefault(); analyze(); }} style={{ marginTop: '30px', padding: '15px 40px', backgroundColor: '#fff', color: '#000', borderRadius: '20px', fontWeight: 'bold', border: 'none' }}>분석 시작</button>}
        </label>
      )}

      {loading && <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '40px', height: '40px', border: '3px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>}

      {result && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={copyResult} style={{ flex: 1, backgroundColor: '#000', border: '1px solid #333', borderRadius: '30px', color: result.startsWith('🚨') ? '#ff4d4d' : '#fff', padding: '20px' }}>
            {result.startsWith('🚨') ? result : "결과 복사하기"}
          </button>
          <button onClick={() => {setFiles([]); setResult('');}} style={{ color: '#444', fontSize: '12px', background: 'none', border: 'none' }}>다시 하기</button>
        </div>
      )}
    </main>
  );
}
// 밑에 3줄
// 분석 성공 시에는 흰색 텍스트로, 실패 시에는 빨간색 경고 문구로 상태를 구분합니다.
// 별도의 팝업 없이 버튼 내부에서 메시지를 전달하여 미니멀한 무드를 유지합니다.
// 분석 실패 후에도 '다시 하기' 버튼을 통해 즉시 초기화가 가능합니다.
