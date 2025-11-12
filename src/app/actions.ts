'use server';

import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "パスワードは必須です"),
});

export async function loginAction(values: z.infer<typeof loginSchema>) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.error || 'ログインに失敗しました' };
    }

    return { success: true, message: 'ログインに成功しました！', user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'ログイン中にエラーが発生しました' };
  }
}

const registrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  dob: z.string(),
});

export async function registerAction(values: z.infer<typeof registrationSchema>): Promise<{ success: boolean; message: string; redirect?: string }> {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.error || '登録に失敗しました',
            };
        }

        return {
            success: true,
            message: '登録に成功しました！ワンネスキングダムへようこそ。',
            redirect: '/dashboard',
        };

    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: '登録中に予期せぬエラーが発生しました。',
        };
    }
}


export async function logoutAction() {
    // Server-side logout action
    // In a real app, you might want to invalidate the session on the server
    // For now, we just return success as the client-side will handle localStorage cleanup
    return { success: true, message: 'ログアウトしました' };
}
