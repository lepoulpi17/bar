import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Profil',
  description: 'Gérez votre profil utilisateur, modifiez votre mot de passe et consultez vos informations personnelles.',
  openGraph: {
    title: 'Mon Profil | Bar du Casino',
    description: 'Gérez votre profil utilisateur, modifiez votre mot de passe et consultez vos informations personnelles.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mon Profil | Bar du Casino',
    description: 'Gérez votre profil utilisateur, modifiez votre mot de passe et consultez vos informations personnelles.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
