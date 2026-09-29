// Receives an order request from the cart ("Send Request" flow) and
// forwards it to the seller's Telegram via a bot — Telegram itself is
// the order inbox, no database needed.
//
// Required environment variables:
//   BOT_TOKEN — token from @BotFather
//   CHAT_ID   — the seller's own chat id (see README)
import { NextResponse } from 'next/server';
import { formatAMD, pluralRu } from '@/lib/format';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

interface OrderItem {
  brand: string;
  name: string;
  size: string;
  price: number;
  quantity?: number;
}

// Escape characters that break Telegram's MarkdownV2 parser.
function esc(s: unknown): string {
  return String(s).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

function isFilled(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function buildOrderMessage(name: string, phone: string, telegram: unknown, items: OrderItem[], total: number): string {
  const itemsList = items
    .map((i) => {
      const qty = i.quantity || 1;
      const qtyWord = pluralRu(qty, 'штука', 'штуки', 'штук');
      // formatAMD output (digits, spaces, ֏) has no MarkdownV2-reserved
      // characters, so it doesn't need escaping.
      return `• ${esc(i.brand)} ${esc(i.name)} \\(${esc(i.size)}\\)  ${esc(qty)} ${qtyWord} — общая сумма: ${formatAMD(i.price * qty)}`;
    })
    .join('\n');

  return (
    `🆕 *Новая заявка с сайта MESIR*\n\n` +
    `👤 Имя: ${esc(name.trim())}\n` +
    `📱 Телефон: ${esc(phone.trim())}\n` +
    `💬 Telegram: ${isFilled(telegram) ? esc(telegram.trim()) : '—'}\n\n` +
    `*Товары:*\n${itemsList}\n\n` +
    `💰 *Итого:* ${formatAMD(total)}`
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
    const { name, telegram, phone, items, total } = await req.json().catch(() => ({}));

    // Reject obviously incomplete submissions before spending a Telegram
    // API call on them.
    if (!isFilled(name) || !isFilled(phone) || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('BOT_TOKEN or CHAT_ID is not set');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const tgData = await sendToTelegram(buildOrderMessage(name, phone, telegram, items, Number(total) || 0));

    if (!tgData.ok) {
      console.error('Telegram API error:', tgData);
      return NextResponse.json(
        { error: 'Failed to send notification', telegram_description: tgData.description || null },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Order handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
