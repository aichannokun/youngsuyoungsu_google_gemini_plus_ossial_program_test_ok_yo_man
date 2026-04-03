'use client';
import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function HiddenReceiptApp() {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fileInputRef.current?.click(); }, []);

  const handleAnalyze = async () => {
    if (!imgRef.current || !crop) return;
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

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const { text } = await res.json();

      await navigator.clipboard.writeText(text);
      alert('복사되었습니다: ' + text);
      
      setImgSrc(''); // 이미지 즉시 삭제 (컴팩트 유지)
      setLoading(false);
    }, 'image/jpeg');
  };

  return (
    <main style={{ padding: '20px', textAlign: 'center' }}>
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={(e) => {
        const reader = new FileReader();
        reader.onload = () => setImgSrc(reader.result?.toString() || '');
        if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
      }} style={{ display: 'none' }} />
      
      {imgSrc && (
        <>
          <ReactCrop crop={crop} onChange={setCrop}>
            <img ref={imgRef} src={imgSrc} alt="Receipt" style={{ maxWidth: '100%' }} />
          </ReactCrop>
          <button onClick={handleAnalyze} disabled={loading} style={{ marginTop: '20px', padding: '15px' }}>
            {loading ? '분석 중...' : '영역 추출 및 복사'}
          </button>
        </>
      )}
    </main>
  );
}