'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Lightbulb, Target, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/lib/icons';

interface PersonalityQuizOption {
  value: string;
  label: string;
}

interface PersonalityQuestion {
  id: string;
  question: string;
  options: PersonalityQuizOption[];
}

const personalityQuestions: PersonalityQuestion[] = [
  {
    id: 'social',
    question: '週末の過ごし方で最も好きなのは？',
    options: [
      { value: 'party', label: 'にぎやかなパーティーで過ごす' },
      { value: 'reading', label: '静かに本を読む' },
      { value: 'friends', label: '友人と過ごしてリフレッシュ' },
      { value: 'alone', label: '一人で過ごしてリフレッシュ' }
    ]
  },
  {
    id: 'energy',
    question: 'エネルギーが湧いてくるときは？',
    options: [
      { value: 'people', label: '人と一緒にいるとき' },
      { value: 'alone', label: '一人でいるとき' },
      { value: 'nature', label: '自然の中で過ごすとき' },
      { value: 'creating', label: '何かを作っているとき' }
    ]
  },
  {
    id: 'decision',
    question: '決断を下すとき、最も重視するのは？',
    options: [
      { value: 'logic', label: '論理的な分析' },
      { value: 'feeling', label: '直感や感情' },
      { value: 'others', label: '周りの人の意見' },
      { value: 'values', label: '自分の価値観' }
    ]
  },
  {
    id: 'stress',
    question: 'ストレスを感じたとき、どう対処しますか？',
    options: [
      { value: 'talk', label: '誰かに話す' },
      { value: 'alone', label: '一人で考える' },
      { value: 'exercise', label: '体を動かす' },
      { value: 'creative', label: '創造的なことをする' }
    ]
  },
  {
    id: 'success',
    question: '成功とは何だと思いますか？',
    options: [
      { value: 'achievement', label: '目標を達成すること' },
      { value: 'happiness', label: '幸せを感じること' },
      { value: 'impact', label: '他者に良い影響を与えること' },
      { value: 'growth', label: '成長し続けること' }
    ]
  }
];

interface UserProfile {
  displayName: string;
  bio: string;
  interests: string[];
  personality: string[];
  goals: string[];
  values: string[];
  relationshipStatus: string;
  occupation: string;
  location: string;
  favoriteQuote: string;
  hobbies: string[];
  personalityQuiz: Record<string, string>;
}

interface ProfilerProps {
  onProfileComplete: (profile: UserProfile) => void;
  isSubmitting?: boolean;
}

const interestOptions = [
  '瞑想', 'ヨガ', '自然', '音楽', 'アート', '料理', 'スポーツ',
  '読書', '執筆', '写真', '旅行', 'ボランティア', 'ガーデニング',
  'ダンス', '歌', 'テクノロジー', '科学', '歴史', '哲学'
];

const personalityOptions = [
  '創造的', '分析的', '共感的', '冒険好き', '穏やか', 'エネルギッシュ',
  '内向的', '外向的', '楽観的', '思慮深い', '自発的', '計画的'
];

const valueOptions = [
  '平和', '愛', '調和', '思いやり', '誠実', '優しさ', '尊重',
  '団結', '成長', '知恵', '自由', '正義', '平等', '持続可能性'
];

const goalOptions = [
  '自己成長', '他者への貢献', 'コミュニティづくり', '新しいスキルの習得',
  '世界を旅する', 'アートを創る', '起業する', '定期的なボランティア',
  '心の平和を得る', '意味のある人間関係を築く', '持続可能な暮らし'
];

const Profiler: React.FC<ProfilerProps> = ({ onProfileComplete, isSubmitting = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    bio: '',
    interests: [],
    personality: [],
    goals: [],
    values: [],
    relationshipStatus: '',
    occupation: '',
    location: '',
    favoriteQuote: '',
    hobbies: [],
    personalityQuiz: {}
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const steps = [
    { title: '基本情報', icon: Users },
    { title: '性格診断', icon: Heart },
    { title: '性格タイプ', icon: Sparkles },
    { title: '興味・価値観', icon: Lightbulb },
    { title: '目標・夢', icon: Target },
    { title: '確認', icon: Sparkles }
  ];

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof UserProfile, item: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(item)
        ? (prev[field] as string[]).filter(i => i !== item)
        : [...(prev[field] as string[]), item]
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeProfile = () => {
    onProfileComplete(profile);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="displayName" className="text-lg font-medium">
                表示名を教えてください *
              </Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => updateProfile('displayName', e.target.value)}
                placeholder="例: ハーモニーシーカー42"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-lg font-medium">
                自己紹介をお願いします
              </Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => updateProfile('bio', e.target.value)}
                placeholder="これまでの歩みや情熱、ワンネスキングダムに来た理由などをお聞かせください..."
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="occupation" className="text-lg font-medium">
                現在のお仕事や活動は？
              </Label>
              <Input
                id="occupation"
                value={profile.occupation}
                onChange={(e) => updateProfile('occupation', e.target.value)}
                placeholder="例: 学生、アーティスト、教師、起業家など"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-lg font-medium">
                どちらにお住まいですか？
              </Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => updateProfile('location', e.target.value)}
                placeholder="例: 東京都、地球市民 など"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-lg font-medium">現在の交際状況</Label>
              <RadioGroup
                value={profile.relationshipStatus}
                onValueChange={(value) => updateProfile('relationshipStatus', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">独身</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="in_relationship" id="in_relationship" />
                  <Label htmlFor="in_relationship">交際中</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="married" id="married" />
                  <Label htmlFor="married">既婚</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prefer_not_say" id="prefer_not_say" />
                  <Label htmlFor="prefer_not_say">回答しない</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 1: // Personality Quiz
        return (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">性格診断クイズ</h2>
              <p className="text-muted-foreground">いくつかの質問に答えて、あなたの性格タイプを診断しましょう</p>
            </div>
            
            {personalityQuestions.map((question, qIndex) => (
              <div key={question.id} className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">{qIndex + 1}. {question.question}</h3>
                <RadioGroup
                  value={profile.personalityQuiz[question.id] || ''}
                  onValueChange={(value) => {
                    setProfile(prev => ({
                      ...prev,
                      personalityQuiz: {
                        ...prev.personalityQuiz,
                        [question.id]: value
                      }
                    }));
                  }}
                  className="space-y-2"
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-md transition-colors">
                      <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                      <Label htmlFor={`${question.id}-${option.value}`} className="text-base font-normal cursor-pointer w-full">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        );

      case 2: // Personality Traits
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">あなたの性格を表す言葉を選んでください</h3>
              <p className="text-sm text-muted-foreground mb-4">
                あなたに当てはまる特徴を3〜5個選択してください
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {personalityOptions.map((trait) => (
                  <div key={trait} className="flex items-center space-x-2">
                    <Checkbox
                      id={trait}
                      checked={profile.personality.includes(trait)}
                      onCheckedChange={() => toggleArrayItem('personality', trait)}
                    />
                    <Label htmlFor={trait} className="text-sm cursor-pointer">
                      {trait}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
              <h4 className="font-medium text-pink-800 mb-2">選択した性格:</h4>
              <div className="flex flex-wrap gap-2">
                {profile.personality.map((trait) => (
                  <Badge key={trait} variant="secondary" className="bg-pink-100 text-pink-800">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Interests & Values
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">興味のあることを教えてください</h3>
              <p className="text-sm text-muted-foreground mb-4">
                好きな活動や趣味を選択してください
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={profile.interests.includes(interest)}
                      onCheckedChange={() => toggleArrayItem('interests', interest)}
                    />
                    <Label htmlFor={interest} className="text-sm cursor-pointer">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">大切にしている価値観は何ですか？</h3>
              <p className="text-sm text-muted-foreground mb-4">
                あなたの人生を支える価値観を選んでください
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {valueOptions.map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={value}
                      checked={profile.values.includes(value)}
                      onCheckedChange={() => toggleArrayItem('values', value)}
                    />
                    <Label htmlFor={value} className="text-sm cursor-pointer">
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">選択した興味:</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">選択した価値観:</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.values.map((value) => (
                    <Badge key={value} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Goals & Dreams
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">目標や夢を教えてください</h3>
              <p className="text-sm text-muted-foreground mb-4">
                叶えたいこと、経験したいことを選択してください
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={profile.goals.includes(goal)}
                      onCheckedChange={() => toggleArrayItem('goals', goal)}
                    />
                    <Label htmlFor={goal} className="text-sm cursor-pointer">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="favoriteQuote" className="text-lg font-medium">
                お気に入りの言葉や座右の銘はありますか？
              </Label>
              <Textarea
                id="favoriteQuote"
                value={profile.favoriteQuote}
                onChange={(e) => updateProfile('favoriteQuote', e.target.value)}
                placeholder="あなたを励ましてくれる言葉を入力してください..."
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="hobbies" className="text-lg font-medium">
                他に好きな趣味や活動はありますか？（カンマ区切り）
              </Label>
              <Input
                id="hobbies"
                value={profile.hobbies.join(', ')}
                onChange={(e) => updateProfile('hobbies', e.target.value.split(',').map(h => h.trim()).filter(h => h))}
                placeholder="例: 絵画, ハイキング, 瞑想, 料理"
                className="mt-2"
              />
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">選択した目標:</h4>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goal) => (
                  <Badge key={goal} variant="secondary" className="bg-purple-100 text-purple-800">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Complete Profile
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600 mb-4">🎉 プロフィールが完成しました！</h3>
              <p className="text-muted-foreground">
                内容を確認し、「登録を完了する」ボタンを押してワンネスキングダムに参加しましょう。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">基本情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>名前:</strong> {profile.displayName}</p>
                  <p><strong>職業・活動:</strong> {profile.occupation}</p>
                  <p><strong>所在地:</strong> {profile.location}</p>
                  <p><strong>交際状況:</strong> {profile.relationshipStatus}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">性格と興味</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong>性格:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.personality.map((trait) => (
                        <Badge key={trait} variant="outline" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>興味:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.interests.slice(0, 3).map((interest) => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {profile.interests.length > 3 && <span className="text-xs text-muted-foreground">+{profile.interests.length - 3} 件</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">あなたについて</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {profile.favoriteQuote && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">大切にしている言葉</CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-sm italic text-center">
                    "{profile.favoriteQuote}"
                  </blockquote>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-kawaii">
            🌟 プロフィールを作成しましょう 🌟
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            ステップ {currentStep + 1} / {steps.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-pink-600' : 'text-gray-400'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  index <= currentStep ? 'bg-pink-100' : 'bg-gray-100'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="min-h-[400px]">
        {renderStepContent()}

        <div className="flex justify-between mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
          >
            戻る
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={completeProfile}
              disabled={!profile.displayName.trim() || isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  <span>少々お待ちください...</span>
                </span>
              ) : (
                '登録を完了する ✨'
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={(currentStep === 0 && !profile.displayName.trim()) || isSubmitting}
            >
              次へ
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Profiler;
