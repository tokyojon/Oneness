'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type GenerationSource = 'photo' | 'random';

export interface GeneratedAvatarPayload {
  imageDataUrl: string;
  avatarConfig: {
    prompt: string;
    gender: 'female' | 'male';
    source: GenerationSource;
    generatedAt: string;
  };
}

interface KawaiiGeneratorProps {
  onAvatarGenerated?: (payload: GeneratedAvatarPayload) => void;
  onSave?: (data: { avatar: GeneratedAvatarPayload['avatarConfig']; imageUrl: string }) => void | Promise<void>;
  isSaving?: boolean;
  onGenerationStart?: () => void;
  onGenerationComplete?: () => void;
  onGenerationFailed?: (message: string) => void;
}

interface GenerationDetails {
  id: string;
  payload: GeneratedAvatarPayload;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// SVG Icon for the loading spinner
const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-10 w-10 text-pink-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// SVG Icon for image placeholders
const ImagePlaceholderIcon: React.FC = () => (
  <svg
    className="h-24 w-24 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.01.01M3 3h18v18H3V3z"
    />
  </svg>
);


export default function KawaiiGenerator({ onAvatarGenerated, onSave, isSaving = false, onGenerationStart, onGenerationComplete, onGenerationFailed }: KawaiiGeneratorProps) {
  const [inputImage, setInputImage] = useState<string | null>(null); // Stores the user's image as data URL
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // Stores the AI's image as data URL
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [gender, setGender] = useState<'female' | 'male'>('female'); // Added gender state, default to 'female'

  const [latestGeneration, setLatestGeneration] = useState<GenerationDetails | null>(null);
  const lastEmittedId = useRef<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Hidden canvas for capturing frame

  /**
   * Utility to fetch with exponential backoff.
   */
  const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<any> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if ((response.status >= 500 || response.status === 429) && retries > 0) {
          console.warn(`Retrying... attempts left: ${retries}`);
          await new Promise(res => setTimeout(res, delay));
          return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return response.json();
    } catch (err) {
      if (retries > 0) {
        console.warn(`Retrying... attempts left: ${retries}`);
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      console.error('Fetch failed after multiple retries:', err);
      throw err;
    }
  };

  /**
   * Starts the user's webcam.
   */
  const startWebcam = async () => {
    stopWebcam();
    setWebcamActive(true);
    setInputImage(null);
    setGeneratedImage(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('カメラにアクセスできません。権限を確認してください。');
      setWebcamActive(false);
    }
  };

  /**
   * Stops the webcam stream.
   */
  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  }, []);

  /**
   * Captures a frame from the webcam feed.
   */
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        setError('画像を取得できませんでした。');
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setInputImage(dataUrl);
      stopWebcam();
    }
  };

  /**
   * Handles file upload from the user's device.
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    stopWebcam();
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.onerror = () => {
        setError('画像ファイルの読み込みに失敗しました。');
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Generic function to call the Gemini API.
   * Can be used for both image-to-image and text-to-image.
   */
  const callGeminiAPI = async ({
    prompt,
    base64Data = null,
    mimeType = null,
    source,
  }: {
    prompt: string;
    base64Data?: string | null;
    mimeType?: string | null;
    source: GenerationSource;
  }) => {
    onGenerationStart?.();
    setIsLoading(true);
    setGeneratedImage(null);
    setLatestGeneration(null);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
      if (!apiKey) {
        throw new Error('Gemini APIキーが設定されていません。');
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: prompt }];

      // If image data is provided, add it to the parts
      if (base64Data && mimeType) {
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }

      const payload = {
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      };

      const result = await fetchWithRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const imagePart = result?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data: string } }) => p.inlineData);

      if (imagePart && imagePart.inlineData?.data) {
        const generatedBase64 = imagePart.inlineData.data;
        const payload: GeneratedAvatarPayload = {
          imageDataUrl: `data:image/png;base64,${generatedBase64}`,
          avatarConfig: {
            prompt,
            gender,
            source,
            generatedAt: new Date().toISOString(),
          },
        };
        setGeneratedImage(payload.imageDataUrl);
        setLatestGeneration({
          id: generateId(),
          payload,
        });
        onGenerationComplete?.();
      } else {
        const textPart = result?.candidates?.[0]?.content?.parts?.find((p: { text?: string }) => p.text);
        if (textPart?.text) {
          const message = `画像生成に失敗しました: ${textPart.text}`;
          setError(message);
          onGenerationFailed?.(message);
        } else {
          const message = '画像生成に失敗しました。画像データを受信できませんでした。';
          setError(message);
          onGenerationFailed?.(message);
          console.error('Invalid API response:', result);
        }
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : '画像生成中に不明なエラーが発生しました。';
      setError(message);
      onGenerationFailed?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generates a caricature based on the user's input image.
   */
  const generateFromImage = () => {
    if (!inputImage) {
      setError('最初に画像をアップロードするか撮影してください。');
      return;
    }
    const [prefix, base64Data] = inputImage.split(',');
    const mimeTypeMatch = prefix.match(/:(.*?);/);
    if (!mimeTypeMatch) {
      setError('画像の形式が正しくありません。');
      return;
    }
    const mimeType = mimeTypeMatch[1];

    const prompt = `Generate a full-length kawaii anime caricature of this person. The person identifies as ${gender}. It must have a large 'chibi' style head, and a very small body and legs. The character should be standing. Match the person's features, hair, and expression in this new anime style.`;

    callGeminiAPI({ prompt, base64Data, mimeType, source: 'photo' });
  };

  /**
   * Generates a random caricature (skip button).
   */
  const generateRandom = () => {
    stopWebcam();
    setInputImage(null); // Clear the input image

    const prompt = `Generate an ultra cute and cuddly kawaii anime caricature of a random ${gender} character of your own creative choice. The design should feel soft, friendly, and huggable, with a large 'chibi' style head, tiny body and legs, standing in a cheerful pose.`;

    callGeminiAPI({ prompt, source: 'random' });
  };

  const handleUseAvatar = useCallback(() => {
    if (!onAvatarGenerated || !latestGeneration) {
      return;
    }

    onAvatarGenerated(latestGeneration.payload);
  }, [latestGeneration, onAvatarGenerated]);

  const handleSaveAvatar = useCallback(async () => {
    if (!onSave || !latestGeneration) {
      return;
    }

    try {
      await onSave({
        avatar: latestGeneration.payload.avatarConfig,
        imageUrl: latestGeneration.payload.imageDataUrl,
      });
    } catch (err) {
      console.error('Failed to save avatar:', err);
    }
  }, [latestGeneration, onSave]);

  useEffect(() => {
    if (!onAvatarGenerated || !latestGeneration) {
      return;
    }

    if (lastEmittedId.current === latestGeneration.id) {
      return;
    }

    lastEmittedId.current = latestGeneration.id;
    onAvatarGenerated(latestGeneration.payload);
  }, [latestGeneration, onAvatarGenerated]);

  return (
    <div className="flex w-full justify-center py-12 font-sans bg-white min-h-screen">
      <div className="w-full max-w-4xl p-6 md:p-10 bg-white rounded-2xl shadow-xl">

        {/* --- Input Selection --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <label className="flex items-center justify-center w-full px-6 py-4 bg-pink-500 text-white rounded-xl shadow-md cursor-pointer hover:bg-pink-600 transition-all font-semibold">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isLoading}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            写真をアップロード
          </label>

          <button
            onClick={startWebcam}
            disabled={isLoading}
            className="flex items-center justify-center w-full px-6 py-4 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-all font-semibold disabled:bg-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            カメラを使用
          </button>
        </div>

        {/* --- Webcam View --- */}
        {webcamActive && (
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
            <div className="flex justify-center p-4 bg-gray-100">
              <button
                onClick={captureImage}
                className="px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-all font-semibold mr-4"
              >
                写真を撮影
              </button>
              <button
                onClick={stopWebcam}
                className="px-6 py-3 bg-red-500 text-white rounded-xl shadow-md hover:bg-red-600 transition-all font-semibold"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* --- Image Previews --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Input Image */}
          <div className="flex flex-col items-center">
            <h2 className="font-semibold text-lg text-gray-700 mb-2">あなたの写真</h2>
            <div className="w-full h-[512px] flex items-center justify-center bg-gray-100 rounded-xl shadow-inner overflow-hidden">
              {inputImage ? (
                <img
                  src={inputImage}
                  alt="Your input"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImagePlaceholderIcon />
              )}
            </div>
          </div>

          {/* Generated Image */}
          <div className="flex flex-col items-center">
            <h2 className="font-semibold text-lg text-gray-700 mb-2">生成されたキャラクター</h2>
            <div className="w-full h-[512px] flex items-center justify-center bg-gray-100 rounded-xl shadow-inner overflow-hidden">
              {isLoading ? (
                <LoadingSpinner />
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated caricature"
                  className="w-full h-full object-contain"
                />
              ) : (
                <ImagePlaceholderIcon />
              )}
            </div>
          </div>
        </div>

        {/* --- Download Button --- */}
        {generatedImage && !isLoading && onSave && (
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 mb-6">
              <button
                onClick={handleSaveAvatar}
                disabled={!latestGeneration || isSaving}
                className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all font-semibold disabled:bg-gray-300"
              >
                {isSaving ? '保存中...' : 'アバターを保存'}
              </button>
          </div>
        )}

        {/* --- Gender Selection --- */}
        <div className="mb-6">
          <label className="block text-center text-lg font-semibold text-gray-700 mb-3">
            キャラクターのタイプ
          </label>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setGender('female')}
              disabled={isLoading}
              className={`w-1/2 md:w-1/3 py-3 rounded-xl font-bold transition-all ${
                gender === 'female'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-white text-pink-500 border-2 border-gray-300'
              }`}
            >
              女性
            </button>
            <button
              onClick={() => setGender('male')}
              disabled={isLoading}
              className={`w-1/2 md:w-1/3 py-3 rounded-xl font-bold transition-all ${
                gender === 'male'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-blue-500 border-2 border-gray-300'
              }`}
            >
              男性
            </button>
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={generateFromImage}
            disabled={!inputImage || isLoading}
            className="w-full py-4 bg-purple-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            写真から生成
          </button>
          <button
            onClick={generateRandom}
            disabled={isLoading}
            className="w-full py-4 bg-gray-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-gray-700 transition-all disabled:bg-gray-300"
          >
            スキップしてかわいいキャラをおまかせ生成
          </button>
        </div>

        {/* --- Error Message --- */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            <strong>エラー:</strong> {error}
          </div>
        )}

        {/* Hidden canvas for webcam capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
