import LegalPage, { type LegalPageContent } from './LegalPage';

const CONTENT: LegalPageContent = {
  eyebrow: ['privacy_eyebrow', 'Legal'],
  title: ['privacy_title', 'Privacy Policy'],
  subtitle: ['privacy_subtitle', 'How MESIR collects, uses, and protects your personal data.'],
  updated: [
    'privacy_updated',
    'This policy is effective from the date of publication and applies to all visitors of mesirfragrance.com.',
  ],
  sections: [
    {
      title: ['privacy_collect_title', '1. What information we collect'],
      text: [
        'privacy_collect_text',
        "When you send an order request from the cart or use the contact form, we collect the information you provide: your name, phone number, Telegram username, and/or email address, along with the message or list of products you're interested in. We do not collect payment card details — orders are confirmed and paid for directly with our team, not through this website.",
      ],
    },
    {
      title: ['privacy_use_title', '2. How we use it'],
      text: [
        'privacy_use_text',
        'We use this information solely to respond to your inquiry, confirm your order, and arrange delivery or pickup. We do not use it for automated marketing, and we do not sell or rent your data to third parties.',
      ],
    },
    {
      title: ['privacy_share_title', '3. Who we share it with'],
      text: [
        'privacy_share_text',
        "Order and contact requests are delivered to our team via Telegram's messaging platform. Product and site content is hosted with Supabase, our database provider. Neither service is authorized to use your data for its own purposes — they act only as our technical infrastructure providers.",
      ],
    },
    {
      title: ['privacy_retention_title', '4. How long we keep it'],
      text: [
        'privacy_retention_text',
        'We retain order and contact information for as long as needed to fulfill your request and to meet our accounting and legal obligations, after which it is deleted. You may request earlier deletion at any time — see your rights below.',
      ],
    },
    {
      title: ['privacy_rights_title', '5. Your rights'],
      text: [
        'privacy_rights_text',
        'Under the Law of the Republic of Armenia "On Protection of Personal Data", you have the right to access the personal data we hold about you, request its correction or deletion, and withdraw your consent to its processing at any time. To exercise any of these rights, contact us using the details below.',
      ],
    },
    {
      title: ['privacy_contact_title', '6. Contact us'],
      text: [
        'privacy_contact_text',
        'For any question about this policy or your personal data, email us at hello@mesirfragrance.com.',
      ],
    },
  ],
};

export default function Privacy() {
  return <LegalPage content={CONTENT} />;
}
