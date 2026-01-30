import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte pour accéder à la gestion du bar, consulter les cocktails et gérer les stocks.',
  openGraph: {
    title: 'Connexion | Bar du Casino',
    description: 'Connectez-vous à votre compte pour accéder à la gestion du bar, consulter les cocktails et gérer les stocks.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Connexion | Bar du Casino',
    description: 'Connectez-vous à votre compte pour accéder à la gestion du bar, consulter les cocktails et gérer les stocks.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
