import LegalPage, { type LegalPageContent } from './LegalPage';

const CONTENT: LegalPageContent = {
  eyebrow: ['returns_eyebrow', 'Customer Care'],
  title: ['returns_title', 'Returns & Exchanges'],
  subtitle: ['returns_subtitle', 'Our policy for returning or exchanging an order.'],
  sections: [
    {
      title: ['returns_period_title', '1. Return period'],
      text: [
        'returns_period_text',
        "You may request a return or exchange within 14 days of receiving your order. To start a return, contact us using the details below — we'll confirm the next steps with you directly.",
      ],
    },
    {
      title: ['returns_condition_title', '2. Condition of the item'],
      text: [
        'returns_condition_text',
        'For hygiene reasons, opened or used perfume and home fragrance products cannot be returned or exchanged unless the item arrived damaged or is not what you ordered. Unopened items in their original packaging are eligible for return within the period above.',
      ],
    },
    {
      title: ['returns_howto_title', '3. How to request a return'],
      text: [
        'returns_howto_text',
        "Message us on Telegram or by email with your order details and the reason for the return. We'll let you know whether the item qualifies and, if so, arrange collection or ask you to send it back.",
      ],
    },
    {
      title: ['returns_refund_title', '4. Refunds'],
      text: [
        'returns_refund_text',
        "Once we've received and checked the returned item, we'll process your refund using the same method you paid with, or arrange an exchange if you prefer. Refunds are typically completed within a few business days of the item reaching us.",
      ],
    },
    {
      title: ['returns_damaged_title', '5. Damaged or incorrect items'],
      text: [
        'returns_damaged_text',
        "If your order arrives damaged or you received the wrong item, contact us as soon as possible with a photo — we'll cover the cost of return shipping and send a replacement or full refund.",
      ],
    },
    {
      title: ['returns_contact_title', '6. Contact us'],
      text: [
        'returns_contact_text',
        'For any return or exchange request, email us at hello@mesirfragrance.com or message us on Telegram.',
      ],
    },
  ],
};

export default function Returns() {
  return <LegalPage content={CONTENT} />;
}
