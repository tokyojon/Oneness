-- Configure Supabase Auth Email Settings
-- Run this in your Supabase SQL Editor

-- Update email templates for newer Supabase versions
-- Password Recovery Email Template
UPDATE auth.email_templates 
SET 
  subject = 'Oneness Kingdom - パスワードリセット',
  body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>パスワードリセット</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; } .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; } .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; } .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; } .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }</style></head><body><div class="header"><h1>Oneness Kingdom</h1><p>パスワードリセットのご案内</p></div><div class="content"><h2>こんにちは</h2><p>パスワードリセットのリクエストを受け付けました。</p><p>以下のボタンをクリックして、新しいパスワードを設定してください：</p><div style="text-align: center;"><a href="{{ .ConfirmationURL }}" class="button">パスワードをリセット</a></div><p>このボタンは24時間有効です。</p><p>もしこのリクエストに心当たりがない場合は、このメールを無視してください。</p><p>安全のため、以下のリンクをコピーしてブラウザに貼り付けることもできます：</p><p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p></div><div class="footer"><p>Regards,<br>Oneness Kingdom Team</p><p><small>このメールにご返信されないようお願いいたします。<br>ご質問の場合は: onenesskingdom2@gmail.com</small></p></div></body></html>'
WHERE template_name = 'recovery';

-- Confirmation Email Template (for new signups)
UPDATE auth.email_templates 
SET 
  subject = 'Oneness Kingdom - アカウント確認',
  body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>アカウント確認</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; } .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; } .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; } .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; } .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }</style></head><body><div class="header"><h1>Oneness Kingdom</h1><p>アカウント確認のご案内</p></div><div class="content"><h2>ようこそ、Oneness Kingdomへ！</h2><p>アカウント登録ありがとうございます。</p><p>以下のボタンをクリックして、アカウントを有効化してください：</p><div style="text-align: center;"><a href="{{ .ConfirmationURL }}" class="button">アカウントを確認</a></div><p>このリンクは24時間有効です。</p><p>安全のため、以下のリンクをコピーしてブラウザに貼り付けることもできます：</p><p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p></div><div class="footer"><p>Regards,<br>Oneness Kingdom Team</p><p><small>このメールにご返信されないようお願いいたします。<br>ご質問の場合は: onenesskingdom2@gmail.com</small></p></div></body></html>'
WHERE template_name = 'confirm_signup';

-- Email Change Template
UPDATE auth.email_templates 
SET 
  subject = 'Oneness Kingdom - メールアドレス変更の確認',
  body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>メールアドレス変更</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; } .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; } .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; } .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; } .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }</style></head><body><div class="header"><h1>Oneness Kingdom</h1><p>メールアドレス変更のご案内</p></div><div class="content"><h2>メールアドレス変更の確認</h2><p>メールアドレスの変更リクエストを受け付けました。</p><p>以下のボタンをクリックして、新しいメールアドレスを確認してください：</p><div style="text-align: center;"><a href="{{ .ConfirmationURL }}" class="button">メールアドレスを確認</a></div><p>このリンクは24時間有効です。</p><p>もしこのリクエストに心当たりがない場合は、このメールを無視してください。</p><p>安全のため、以下のリンクをコピーしてブラウザに貼り付けることもできます：</p><p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p></div><div class="footer"><p>Regards,<br>Oneness Kingdom Team</p><p><small>このメールにご返信されないようお願いいたします。<br>ご質問の場合は: onenesskingdom2@gmail.com</small></p></div></body></html>'
WHERE template_name = 'email_change';

-- Magic Link Template
UPDATE auth.email_templates 
SET 
  subject = 'Oneness Kingdom - マジックリンク',
  body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>マジックリンク</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; } .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; } .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; } .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; } .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }</style></head><body><div class="header"><h1>Oneness Kingdom</h1><p>ログインリンクのご案内</p></div><div class="content"><h2>こんにちは</h2><p>Oneness Kingdomへのログインリクエストを受け付けました。</p><p>以下のボタンをクリックして、ログインしてください：</p><div style="text-align: center;"><a href="{{ .ConfirmationURL }}" class="button">ログイン</a></div><p>このリンクは24時間有効です。</p><p>もしこのリクエストに心当たりがない場合は、このメールを無視してください。</p><p>安全のため、以下のリンクをコピーしてブラウザに貼り付けることもできます：</p><p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p></div><div class="footer"><p>Regards,<br>Oneness Kingdom Team</p><p><small>このメールにご返信されないようお願いいたします。<br>ご質問の場合は: onenesskingdom2@gmail.com</small></p></div></body></html>'
WHERE template_name = 'magic_link';

-- Check if templates exist and show results
SELECT template_name, subject FROM auth.email_templates;
