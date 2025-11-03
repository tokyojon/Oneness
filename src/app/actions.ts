'use server';

import { z } from 'zod';
import { aiEnhancedRegistration, AIEnhancedRegistrationOutput } from '@/ai/flows/ai-enhanced-registration';
import { automatedAgeVerification } from '@/ai/flows/automated-age-verification';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "パスワードは必須です"),
});

export async function loginAction(values: z.infer<typeof loginSchema>) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app, you'd validate credentials against a database
  console.log('Login attempt:', values);
  return { success: true, message: 'ログインに成功しました！' };
}

const registrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  dob: z.string(),
  photoDataUri: z.string(),
  documentDataUri: z.string(),
});

export async function registerAction(values: z.infer<typeof registrationSchema>): Promise<{ success: boolean; message: string; aiResult?: AIEnhancedRegistrationOutput }> {
    try {
        const age = new Date().getFullYear() - new Date(values.dob).getFullYear();

        const aiResult = await aiEnhancedRegistration({
            photoDataUri: values.photoDataUri,
            documentDataUri: values.documentDataUri,
            age: age
        });

        if (!aiResult.isLegitimate) {
            return {
                success: false,
                message: '登録を確認できませんでした。もう一度試すか、サポートにお問い合わせください。',
                aiResult,
            };
        }

        // In a real app, you would save the user to the database here.
        console.log('User registered successfully with AI verification:', values.email);

        return {
            success: true,
            message: '登録に成功しました！ワンネスキングダムへようこそ。',
            aiResult,
        };

    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: '登録中に予期せぬエラーが発生しました。',
        };
    }
}

const ageVerificationSchema = z.object({
  documentDataUri: z.string(),
});

export async function verifyAgeAction(values: z.infer<typeof ageVerificationSchema>) {
    try {
        const result = await automatedAgeVerification(values);
        return { success: true, data: result };
    } catch (error) {
        console.error('Age verification error:', error);
        return { success: false, message: '年齢確認中に予期せぬエラーが発生しました。' };
    }
}
