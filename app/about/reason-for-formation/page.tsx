import type { Metadata } from 'next';
import ReasonForFormationScroll from '@/components/ReasonForFormationScroll';

export const metadata: Metadata = {
  title: 'Reason for Formation',
  description:
    'A heartfelt founder message on why Bitcoin for the Arts exists and how it empowers creators.',
};

export default function ReasonForFormationPage() {
  return <ReasonForFormationScroll />;
}
