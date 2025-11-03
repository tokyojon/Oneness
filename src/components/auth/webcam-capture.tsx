'use client';

import { Camera, RefreshCcw, Check } from 'lucide-react';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string | null) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 480 }, height: { ideal: 360 } } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Webカメラへのアクセスエラー:", err);
      setError("Webカメラにアクセスできませんでした。権限を確認してもう一度お試しください。");
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, [startStream]);
  
  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context){
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUri);
        onCapture(dataUri);
        stopStream();
      }
    }
  }, [onCapture]);

  const reset = () => {
    setImageSrc(null);
    onCapture(null);
    startStream();
  };

  return (
    <div className="w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden border">
      <canvas ref={canvasRef} className="hidden" />
      {imageSrc ? (
        <>
          <Image src={imageSrc} alt="撮影した画像" layout="fill" objectFit="cover" />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <Button size="icon" variant="secondary" onClick={reset}>
              <RefreshCcw className="w-5 h-5" />
              <span className="sr-only">再撮影</span>
            </Button>
          </div>
          <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
            <Check className="w-5 h-5" />
          </div>
        </>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {isStreaming && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <Button size="icon" onClick={capture} className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90">
                    <Camera className="w-7 h-7" />
                    <span className="sr-only">撮影</span>
                </Button>
            </div>
          )}
          {error && <p className="absolute text-center p-4 text-sm text-destructive-foreground bg-destructive/80">{error}</p>}
        </>
      )}
    </div>
  );
};

export default WebcamCapture;
