'use client';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop'; // 설치한 라이브러리

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. 파일 선택 시 프리뷰 생성
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // 2. 크롭된 부분만 추출하여 서버로 전송
  const handleAnalyze = async () => {
    if (!image || !croppedAreaPixels) return;
    setLoading(true);

    try {
      // Canvas를 이용해 크롭된 이미지만 Blob으로 변환
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      const formData = new FormData();
      formData.append('image', croppedImage, 'receipt.jpg');

      // 기존 5회 재시도 로직 호출 (생략 가능하나 유지 권장)
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data.text || data.error);
    } catch (e) {
      setResult("크롭 처리 중 오류가 발생했습니다.");
    }
    setLoading(false);
    setImage(null); // 분석 후 초기화
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      {!image ? (
        <label className="w-full max-w-xs h-64 flex flex-col items-center justify-center border-4 border-dashed border-blue-500 rounded-2xl cursor-pointer">
          <span className="text-5xl mb-4">📷</span>
          <span className="text-lg font-semibold">영수증 촬영</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
        </label>
      ) : (
        <div className="relative w-full max-w-md h-96 bg-black rounded-xl overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
          <button 
            onClick={handleAnalyze}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 px-8 py-3 rounded-full font-bold shadow-lg"
          >
            선택 영역 분석하기 🚀
          </button>
        </div>
      )}

      {loading && <p className="mt-8 animate-pulse text-blue-400 font-bold">크롭된 영역 분석 중...</p>}
      {result && <div className="mt-8 p-6 bg-gray-800 rounded-xl border border-blue-500 w-full max-w-md font-mono">{result}</div>}
    </main>
  );
}

// --- 크롭 이미지 변환 헬퍼 함수 ---
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx?.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/jpeg'));
}
