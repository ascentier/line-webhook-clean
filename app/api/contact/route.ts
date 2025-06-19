/* -------------------------------------------------
   Runtime 指定（Vercel Edge → Node.js に強制）
------------------------------------------------- */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* -------------------------------------------------
   お問い合わせ内容を LINE にプッシュ送信する API
------------------------------------------------- */
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    /* フォームの各フィールドを取得 ------------------ */
    const form = await req.formData();

    const name    = form.get('name')?.toString()   ?? '';
    const email   = form.get('email')?.toString()  ?? '';
    const phone   = form.get('phone')?.toString()  ?? '';
    const message = form.get('message')?.toString()?? '';

    /* 受付日時を成形 -------------------------------- */
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ` +
                    `${now.getHours()}時${now.getMinutes().toString().padStart(2,'0')}分`;

    /* 送信する LINE 文面 ---------------------------- */
    const text = `
ホームプロガードお問い合わせ

👤お客様情報
【お名前】${name}
【電話番号】${phone}
【メールアドレス】${email}

💬お問い合わせ内容
${message}

🗓️受付日時
${dateStr}
`.trim();

    /* 環境変数を取得 -------------------------------- */
    const token  = process.env.LINE_CHANNEL_ACCESS_TOKEN; // ボットのチャネルアクセストークン
    const userId = process.env.LINE_ADMIN_USER_ID;        // 通知を受け取る LINE userId

    if (!token || !userId) {
      console.error('❌ LINE の環境変数が設定されていません');
      return new Response('LINE 環境変数未設定', { status: 500 });
    }

    /* LINE へプッシュ送信 --------------------------- */
    await fetch('https://api.line.me/v2/bot/message/push', {
      method : 'POST',
      headers: {
        Authorization : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to      : userId,
        messages: [{ type: 'text', text }],
      }),
    });

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('❌ contact route でエラー:', err);
    return new Response('Server Error', { status: 500 });
  }
}

/* GET は動作確認用 -------------------------------- */
export async function GET() {
  return new Response('OK', { status: 200 });
}
