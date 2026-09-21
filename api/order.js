// api/order.js
//
// Vercel Serverless Function. Receives an order request from the site's
// cart ("Send Request" flow) and forwards it as a message to the seller's
// Telegram via a bot, so no database is needed — Telegram itself is the
// order inbox.
//
// Required environment variables (set in the Vercel dashboard,
// Project → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN  — token from @BotFather
//   TELEGRAM_CHAT_ID    — the seller's own chat id (see README section
//                          "Настройка Telegram-бота" for how to get it)

module.exports = async (req, res) => {
  // CORS/method guard — this endpoint only accepts POST from the site itself.
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, telegram, phone, items, total } = req.body || {};

    // Basic validation — reject obviously incomplete submissions before
    // spending a Telegram API call on them.
    if (
      !name || typeof name !== 'string' || !name.trim() ||
      !phone || typeof phone !== 'string' || !phone.trim() ||
      !Array.isArray(items) || items.length === 0
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      // Server misconfigured — env vars not set yet in Vercel.
      console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set');
      res.status(500).json({ error: 'Server not configured' });
      return;
    }

    // Escape characters that break Telegram's MarkdownV2 parser.
    const esc = (s) => String(s).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

    const itemsList = items
      .map((i) => `• ${esc(i.brand)} ${esc(i.name)} (${esc(i.size)}) — $${esc(i.price)}`)
      .join('\n');

    const text =
      `🆕 *Новая заявка с сайта MESIR*\n\n` +
      `👤 Имя: ${esc(name.trim())}\n` +
      `📱 Телефон: ${esc(phone.trim())}\n` +
      `💬 Telegram: ${telegram && telegram.trim() ? esc(telegram.trim()) : '—'}\n\n` +
      `*Товары:*\n${itemsList}\n\n` +
      `💰 *Итого:* $${esc(total)}`;

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
      res.status(502).json({ error: 'Failed to send notification' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Order handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
