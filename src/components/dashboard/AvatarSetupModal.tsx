import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import KawaiiGenerator, { GeneratedAvatarPayload } from "../KawaiiGenerator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

import { login } from "@/lib/auth";

interface AvatarSetupModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
  personalityData?: any;
}

export default function AvatarSetupModal({
  isOpen: controlledIsOpen,
  onClose,
  onComplete,
  personalityData
}: AvatarSetupModalProps = {}) {
  const { user } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Track if we have already generated the profile to avoid duplicates
  const hasGeneratedProfile = useRef(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = onClose || (() => setInternalIsOpen(false));

  useEffect(() => {
    // Only run automatic detection if not controlled externally
    if (controlledIsOpen === undefined && user) {
      // Check if user has finished onboarding. If not, don't popup yet (let onboarding modal handle it)
      const onboardingCompleted = user.profile?.onboarding_completed;
      if (!onboardingCompleted) {
        return;
      }

      // We assume if avatar_url is null or missing, they need to set one up.
      // We also check if it's not the placeholder we might use in UI fallback
      const hasAvatar = !!user.profile?.avatar_url;

      if (!hasAvatar) {
        // Small delay to ensure we don't pop up immediately if data is loading or conflicting
        const timer = setTimeout(() => {
          setInternalIsOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, controlledIsOpen]);

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

  const generateCharacterProfile = async () => {
    if (!personalityData || hasGeneratedProfile.current) return;

    console.log("Generating character profile based on:", personalityData);
    hasGeneratedProfile.current = true; // Prevent multiple calls

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
      if (!apiKey) {
        console.error('Gemini API key missing');
        return;
      }

      const prompt = `
        Based on the following user personality traits, create a creative and engaging "Character Profile" (max 200 characters) for a digital kingdom.
        Traits:
        - Social Style: ${personalityData.socialStyle}
        - Communication: ${personalityData.communicationStyle}
        - Interests: ${personalityData.interests.join(', ')}
        - Work/Life: ${personalityData.workLifeBalance}
        - Type: ${personalityData.personalityType}
        
        Output only the character description text in Japanese.
      `;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to generate text');

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        console.log("Generated Character Profile:", generatedText);
        // Save to DB
        await saveCharacterProfile(generatedText);
      }

    } catch (error) {
      console.error("Error generating character profile:", error);
      hasGeneratedProfile.current = false; // Reset on error to allow retry
    }
  };

  const saveCharacterProfile = async (text: string) => {
    try {
      // We need to merge this into the existing personality_profile
      // Since we don't have a specific endpoint for partial updates to the json column,
      // and we want to avoid race conditions, ideally the API handles it.
      // But for now, we'll fetch the current profile first or just send what we have + traits.
      // Actually, we have 'personalityData' which IS the current profile data from the previous step.

      const updatedProfile = {
        ...personalityData,
        traits: text
      };

      const token = localStorage.getItem('auth_token');
      await fetch('/api/profile/personality', {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality_profile: updatedProfile
        }),
      });

      toast({
        title: 'キャラクター設定完了',
        description: 'あなたの性格からキャラクタープロフィールが生成されました！',
      });

    } catch (error) {
      console.error("Error saving character profile:", error);
    }
  };

  const handleAvatarSave = async (data: { avatar: GeneratedAvatarPayload['avatarConfig']; imageUrl: string }) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
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
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
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
            avatar_url: result.url || result.avatarUrl || data.imageUrl
          }
        };
        login(updatedUser);
      }

      // Call completion callback if provided
      if (onComplete) {
        onComplete();
      } else {
        // Default behavior: reload page
        window.location.reload();
      }

      handleClose();

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
          onGenerationStart={() => {
            // Trigger character profile generation when avatar generation starts
            generateCharacterProfile();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
