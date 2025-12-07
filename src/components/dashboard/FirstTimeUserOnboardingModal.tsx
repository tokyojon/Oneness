'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AvatarSetupModal from "./AvatarSetupModal";

interface OnboardingData {
  username: string;
  bio: string;
  location: string;
  personality: {
    socialStyle: string; // group vs individual
    communicationStyle: string; // direct vs indirect
    interests: string[];
    workLifeBalance: string;
    meetingPreference: string;
    personalityType: string; // MBTI or similar
  };
}

const LOCATIONS = [
  '東京', '大阪', '京都', '福岡', '札幌', '仙台', '名古屋', '横浜', '神戸', 'その他'
];

const SOCIAL_STYLES = [
  { value: 'group', label: 'グループ活動が好き', description: 'みんなで一緒に何かをするのが楽しい' },
  { value: 'individual', label: '個人活動が好き', description: '一人で集中して取り組むのが好き' },
  { value: 'balanced', label: 'バランス型', description: '状況に応じて使い分ける' }
];

const COMMUNICATION_STYLES = [
  { value: 'direct', label: '直接的なコミュニケーション', description: 'はっきりと意見を言う方' },
  { value: 'indirect', label: '間接的なコミュニケーション', description: '相手の気持ちを考えて伝える方' },
  { value: 'balanced', label: 'バランス型', description: '相手や状況に応じて使い分ける' }
];

const INTERESTS = [
  'アート', '音楽', 'スポーツ', '読書', '料理', '旅行', '写真', 'ゲーム',
  'プログラミング', 'デザイン', 'ヨガ', '登山', 'カフェ巡り', '映画', 'ファッション'
];

const WORK_LIFE_BALANCE = [
  { value: 'work-focused', label: '仕事重視', description: 'キャリアやスキルアップに力を入れたい' },
  { value: 'life-focused', label: '生活重視', description: '趣味やプライベートを大切にしたい' },
  { value: 'balanced', label: 'バランス重視', description: '仕事と生活の調和を大切にしたい' }
];

const MEETING_PREFERENCES = [
  { value: 'weekend', label: '週末', description: '土日が主な活動時間' },
  { value: 'weekday', label: '平日', description: '平日の夜などが主な活動時間' },
  { value: 'flexible', label: '柔軟', description: 'いつでもOK' }
];

const PERSONALITY_TYPES = [
  { value: 'enthusiast', label: '情熱家', description: '新しいことに挑戦するのが好き' },
  { value: 'thinker', label: '思考家', description: '深く考えてから行動する方' },
  { value: 'helper', label: '支援者', description: '人の役に立つことが好き' },
  { value: 'organizer', label: '企画者', description: 'みんなをまとめるのが好き' }
];

export default function FirstTimeUserOnboardingModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    username: '',
    bio: '',
    location: '',
    personality: {
      socialStyle: '',
      communicationStyle: '',
      interests: [],
      workLifeBalance: '',
      meetingPreference: '',
      personalityType: ''
    }
  });

  useEffect(() => {
    // Check if user needs onboarding
    if (user) {
      console.log('FirstTimeUserOnboardingModal: User data:', user);
      console.log('FirstTimeUserOnboardingModal: User profile:', user.profile);

      const needsOnboarding = !user.profile?.display_name ||
        !user.profile?.location ||
        !user.profile?.bio ||
        !user.profile?.avatar_url ||
        !user.profile?.personality_profile ||
        user.profile?.onboarding_completed === false;

      console.log('FirstTimeUserOnboardingModal: Needs onboarding check:', {
        hasDisplayName: !!user.profile?.display_name,
        hasLocation: !!user.profile?.location,
        hasBio: !!user.profile?.bio,
        hasAvatar: !!user.profile?.avatar_url,
        hasPersonality: !!user.profile?.personality_profile,
        onboardingCompleted: user.profile?.onboarding_completed,
        needsOnboarding
      });

      if (needsOnboarding) {
        console.log('FirstTimeUserOnboardingModal: Opening modal');
        setIsOpen(true);
        // Pre-fill some data if available
        if (user.profile?.display_name) {
          setOnboardingData(prev => ({ ...prev, username: user.profile.display_name }));
        }
        if (user.profile?.bio) {
          setOnboardingData(prev => ({ ...prev, bio: user.profile.bio }));
        }
        if (user.profile?.location) {
          setOnboardingData(prev => ({ ...prev, location: user.profile.location }));
        }
      } else {
        console.log('FirstTimeUserOnboardingModal: Not opening modal - user completed onboarding');
      }
    } else {
      console.log('FirstTimeUserOnboardingModal: No user data available');
    }
  }, [user]);

  const updateData = (field: string, value: any) => {
    if (field.startsWith('personality.')) {
      const personalityField = field.replace('personality.', '');
      setOnboardingData(prev => ({
        ...prev,
        personality: {
          ...prev.personality,
          [personalityField]: value
        }
      }));
    } else {
      setOnboardingData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const toggleInterest = (interest: string) => {
    setOnboardingData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        interests: prev.personality.interests.includes(interest)
          ? prev.personality.interests.filter(i => i !== interest)
          : [...prev.personality.interests, interest]
      }
    }));
  };

  const saveBasicInfo = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: onboardingData.username,
          bio: onboardingData.bio,
          location: onboardingData.location
        }),
      });

      if (!response.ok) {
        throw new Error('プロフィールの保存に失敗しました');
      }

      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '不明なエラーが発生しました'
      });
      return false;
    }
  };

  const savePersonalityProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/profile/personality', {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality_profile: onboardingData.personality
        }),
      });

      if (!response.ok) {
        throw new Error('性格プロフィールの保存に失敗しました');
      }

      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '不明なエラーが発生しました'
      });
      return false;
    }
  };

  const completeOnboarding = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/profile/complete-onboarding', {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('オンボーディング完了の更新に失敗しました');
      }

      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!onboardingData.username || !onboardingData.bio || !onboardingData.location) {
        toast({
          variant: 'destructive',
          title: '入力エラー',
          description: 'すべての項目を入力してください'
        });
        return;
      }

      const saved = await saveBasicInfo();
      if (saved) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Validate step 2
      if (!onboardingData.personality.socialStyle ||
        !onboardingData.personality.communicationStyle ||
        onboardingData.personality.interests.length === 0) {
        toast({
          variant: 'destructive',
          title: '入力エラー',
          description: 'すべての質問に回答してください'
        });
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validate step 3
      if (!onboardingData.personality.workLifeBalance ||
        !onboardingData.personality.meetingPreference ||
        !onboardingData.personality.personalityType) {
        toast({
          variant: 'destructive',
          title: '入力エラー',
          description: 'すべての質問に回答してください'
        });
        return;
      }

      const saved = await savePersonalityProfile();
      if (saved) {
        setCurrentStep(4);
        setShowAvatarModal(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAvatarComplete = async () => {
    setIsCompleting(true);

    // Mark onboarding as complete in database
    await completeOnboarding();

    toast({
      title: '登録完了！',
      description: 'ようこそワンネスキングダムへ！'
    });
    setIsOpen(false);
    setShowAvatarModal(false);
    setIsCompleting(false);
  };

  const progressPercentage = (currentStep / 4) * 100;

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen && !showAvatarModal} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              初回設定を完了しましょう
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Step {currentStep} of 4</p>
              <p className="text-sm text-gray-500">{progressPercentage}% 完了</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#ec6d13] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">基本情報を設定しましょう</h3>
                  <p className="text-gray-600">あなたの基本情報を教えてください</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ユーザー名</label>
                    <Input
                      placeholder="ユーザー名を入力"
                      value={onboardingData.username}
                      onChange={(e) => updateData('username', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">自己紹介</label>
                    <Textarea
                      placeholder="あなたのことを教えてください"
                      rows={3}
                      value={onboardingData.bio}
                      onChange={(e) => updateData('bio', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">居住地</label>
                    <select
                      className="w-full p-3 border rounded-lg"
                      value={onboardingData.location}
                      onChange={(e) => updateData('location', e.target.value)}
                    >
                      <option value="">選択してください</option>
                      {LOCATIONS.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">性格と興味について</h3>
                  <p className="text-gray-600">あなたの性格や興味を教えてください</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">社交スタイル</label>
                    <div className="space-y-2">
                      {SOCIAL_STYLES.map(style => (
                        <label key={style.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="socialStyle"
                            value={style.value}
                            checked={onboardingData.personality.socialStyle === style.value}
                            onChange={(e) => updateData('personality.socialStyle', e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-gray-500">{style.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">コミュニケーションスタイル</label>
                    <div className="space-y-2">
                      {COMMUNICATION_STYLES.map(style => (
                        <label key={style.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="communicationStyle"
                            value={style.value}
                            checked={onboardingData.personality.communicationStyle === style.value}
                            onChange={(e) => updateData('personality.communicationStyle', e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-gray-500">{style.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">興味・関心（複数選択可）</label>
                    <div className="grid grid-cols-3 gap-2">
                      {INTERESTS.map(interest => (
                        <label key={interest} className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={onboardingData.personality.interests.includes(interest)}
                            onChange={() => toggleInterest(interest)}
                            className="mr-2"
                          />
                          <span className="text-sm">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">生活スタイルについて</h3>
                  <p className="text-gray-600">最後の質問です</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">ワークライフバランス</label>
                    <div className="space-y-2">
                      {WORK_LIFE_BALANCE.map(option => (
                        <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="workLifeBalance"
                            value={option.value}
                            checked={onboardingData.personality.workLifeBalance === option.value}
                            onChange={(e) => updateData('personality.workLifeBalance', e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">活動時間の希望</label>
                    <div className="space-y-2">
                      {MEETING_PREFERENCES.map(option => (
                        <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="meetingPreference"
                            value={option.value}
                            checked={onboardingData.personality.meetingPreference === option.value}
                            onChange={(e) => updateData('personality.meetingPreference', e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">性格タイプ</label>
                    <div className="space-y-2">
                      {PERSONALITY_TYPES.map(type => (
                        <label key={type.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="personalityType"
                            value={type.value}
                            checked={onboardingData.personality.personalityType === type.value}
                            onChange={(e) => updateData('personality.personalityType', e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              戻る
            </Button>
            <Button
              onClick={handleNext}
              className="bg-[#ec6d13] hover:bg-[#d45f0f] text-white"
            >
              {currentStep === 3 ? 'アバター設定へ' : '次へ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Setup Modal */}
      <AvatarSetupModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onComplete={handleAvatarComplete}
        personalityData={onboardingData.personality}
      />
    </>
  );
}
