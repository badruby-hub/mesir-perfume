// Receives a question / consultation request from the Contacts page form
// and forwards it to the seller's Telegram — same bot as the order flow
// (send-order), just a different message shape.
//
// Required environment variables:
//   BOT_TOKEN — token from @BotFather
//   CHAT_ID   — the seller's own chat id (see README)
import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

// Escape characters that break Telegram's MarkdownV2 parser. This must
// cover both the interpolated values and any literal punctuation written
// in the template itself.
function esc(s: unknown): string {
  return String(s).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

function isFilled(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function buildHelpMessage(name: string, email: string, subject: unknown, message: string): string {
  return (
    `📩 *Новое сообщение с формы контактов MESIR*\n\n` +
    `👤 Имя: ${esc(name.trim())}\n` +
    `✉️ Email: ${esc(email.trim())}\n` +
    `📝 Тема: ${isFilled(subject) ? esc(subject.trim()) : '—'}\n\n` +
    `*Сообщение:*\n${esc(message.trim())}`
  );
}

async function sendToTelegram(text: string) {
  const res = await fetch(TELEGRAM_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'MarkdownV2' }),
  });
  return (await res.json()) as { ok: boolean; description?: string };
}

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json().catch(() => ({}));

    if (!isFilled(name) || !isFilled(email) || !isFilled(message)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('BOT_TOKEN or CHAT_ID is not set');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const tgData = await sendToTelegram(buildHelpMessage(name, email, subject, message));

    if (!tgData.ok) {
      console.error('Telegram API error:', tgData);
      return NextResponse.json(
        { error: 'Failed to send notification', telegram_description: tgData.description || null },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Help handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
