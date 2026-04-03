'use client';
import { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function ReceiptScanner() {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 앱 실행 시 사진 선택창 자동 실행
  useEffect(() => { fileInputRef.current?.click(); }, []);

  const handleAnalyze = async () => {
    if (!imgRef.current || !crop || crop.width === 0) return;
    setLoading(true);

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = crop.width; canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    
    ctx?.drawImage(
      imgRef.current, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY,
      0, 0, crop.width, crop.height
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob);

      try {
        const res = await fetch('/api/analyze', { method: 'POST', body: formData });
        const { text } = await res.json();
        
        // 클립보드 자동 복사
        await navigator.clipboard.writeText(text);
        alert('복사되었습니다!\n' + text);
        
        // 컴팩트하게 이미지 즉시 삭제
        setImgSrc('');
      } catch (error) {
        alert('분석 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  return (
    <main style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={(e) => {
        const reader = new FileReader();
        reader.onload = () => setImgSrc(reader.result?.toString() || '');
        if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
      }} style={{ display: 'none' }} />
      
      {imgSrc ? (
        <>
          <p>분석할 영역을 지정해주세요.</p>
          <ReactCrop crop={crop} onChange={setCrop}>
            <img ref={imgRef} src={imgSrc} alt="영수증" style={{ maxWidth: '100%', maxHeight: '60vh' }} />
          </ReactCrop>
          <br />
          <button onClick={handleAnalyze} disabled={loading} style={{ marginTop: '20px', padding: '15px 30px', fontSize: '16px' }}>
            {loading ? '분석 중...' : '이 영역 추출 후 복사하기'}
          </button>
        </>
      ) : (
        <button onClick={() => fileInputRef.current?.click()} style={{ padding: '15px', fontSize: '16px' }}>
          사진 다시 선택
        </button>
      )}
    </main>
  );
}
