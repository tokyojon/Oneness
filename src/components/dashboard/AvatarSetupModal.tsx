'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import KawaiiGenerator, { GeneratedAvatarPayload } from "../KawaiiGenerator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

import { login } from "@/lib/auth";

export default function AvatarSetupModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and has no avatar
    if (user) {
      // We assume if avatar_url is null or missing, they need to set one up.
      // We also check if it's not the placeholder we might use in UI fallback
      const hasAvatar = !!user.profile?.avatar_url;
      
      if (!hasAvatar) {
        // Small delay to ensure we don't pop up immediately if data is loading or conflicting
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const resizeImage = (dataUrl: string, maxWidth: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
            }, 'image/jpeg', 0.85);
        }
      };
    });
  };

  const handleAvatarSave = async (data: { avatar: GeneratedAvatarPayload['avatarConfig']; imageUrl: string }) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      // Note: We are using cookie-based auth mostly, but some components might check this.
      // If using cookies, we don't strictly need the token header if the API handles cookies.
      // However, the existing upload code used it.
      
      // Resize and convert to blob
      const blob = await resizeImage(data.imageUrl, 512);
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('avatar_config', JSON.stringify(data.avatar));

      // Upload avatar
      const uploadResponse = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload avatar');
      }

      const result = await uploadResponse.json();

      toast({
        title: 'アバターを保存しました',
        description: 'あなたの王国での姿が決まりました！',
      });
      
      // Update local user state
      if (user) {
        const updatedUser = { 
          ...user, 
          profile: { 
            ...user.profile, 
            avatar_url: result.url || data.imageUrl 
          } 
        };
        login(updatedUser);
        // Force a reload to update all components
        window.location.reload();
      }
      
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        variant: 'destructive',
        title: '保存エラー',
        description: 'アバターの保存に失敗しました。もう一度お試しください。',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-pink-600">
            あなたのキャラクターを作りましょう
          </DialogTitle>
          <DialogDescription className="text-center">
            ワンネスキングダムでのあなたの姿を生成します。写真から作るか、おまかせで生成できます。
          </DialogDescription>
        </DialogHeader>
        
        <KawaiiGenerator 
          onSave={handleAvatarSave}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  );
}
