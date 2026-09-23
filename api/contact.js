// api/contact.js
//
// Vercel Serverless Function. Receives a submission from the Contact page
// form and forwards it as a message to the seller's Telegram — same bot
// as the cart's "Send Request" flow (api/order.js), just a different
// message shape. No database needed.
//
// Required environment variables (already set for api/order.js — reused
// here, no extra setup needed):
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, subject, message } = req.body || {};

    if (
      !name || typeof name !== 'string' || !name.trim() ||
      !email || typeof email !== 'string' || !email.trim() ||
      !message || typeof message !== 'string' || !message.trim()
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set');
      res.status(500).json({ error: 'Server not configured' });
      return;
    }

    // Escape characters that break Telegram's MarkdownV2 parser. This
    // must cover BOTH the interpolated values AND any literal punctuation
    // we write ourselves in the template below (parentheses, periods,
    // etc.) — see api/order.js's history for why that distinction matters.
    const esc = (s) => String(s).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

    const text =
      `📩 *Новое сообщение с формы контактов MESIR*\n\n` +
      `👤 Имя: ${esc(name.trim())}\n` +
      `✉️ Email: ${esc(email.trim())}\n` +
      `📝 Тема: ${subject && subject.trim() ? esc(subject.trim()) : '—'}\n\n` +
      `*Сообщение:*\n${esc(message.trim())}`;

    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
      }),
    });

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      console.error('Telegram API error:', tgData);
      res.status(502).json({ error: 'Failed to send notification', telegram_description: tgData.description || null });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
