import type { Metadata } from 'next';
import Contacts from '@/components/pages/Contacts';

export const metadata: Metadata = { title: 'Contact — MESIR Perfume' };

export default function ContactsPage() {
  return <Contacts />;
}
