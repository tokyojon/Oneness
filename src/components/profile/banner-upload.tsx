'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface BannerUploadProps {
  currentBanner: string;
  onBannerChange: (bannerUrl: string) => void;
  isUploading?: boolean;
}

export function BannerUpload({ currentBanner, onBannerChange, isUploading = false }: BannerUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentBanner);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onBannerChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveBanner = () => {
    setPreviewUrl('/default_banner.png');
    onBannerChange('/default_banner.png');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Banner Preview */}
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25">
          <Image
            src={previewUrl}
            alt="Banner Preview"
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
          />
          
          {/* Overlay with upload button */}
          <div 
            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
              isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center text-white">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">ドラッグ＆ドロップまたはクリックしてアップロード</p>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {previewUrl !== '/default_banner.png' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveBanner}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'アップロード中...' : '変更'}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-muted-foreground">
        <p>• 推奨サイズ: 1920x640ピクセル</p>
        <p>• 対応形式: JPG, PNG, GIF</p>
        <p>• 最大ファイルサイズ: 5MB</p>
      </div>
    </div>
  );
}
