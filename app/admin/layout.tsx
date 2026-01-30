import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administration',
  description: 'Interface d\'administration pour la gestion des cocktails, ingrédients, stocks, utilisateurs et paramètres du bar.',
  openGraph: {
    title: 'Administration | Bar du Casino',
    description: 'Interface d\'administration pour la gestion des cocktails, ingrédients, stocks, utilisateurs et paramètres du bar.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Administration | Bar du Casino',
    description: 'Interface d\'administration pour la gestion des cocktails, ingrédients, stocks, utilisateurs et paramètres du bar.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
