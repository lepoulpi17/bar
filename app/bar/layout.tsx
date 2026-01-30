import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carte des Cocktails',
  description: 'Découvrez notre sélection de cocktails classiques et signatures avec recettes détaillées, ingrédients et instructions de préparation.',
  openGraph: {
    title: 'Carte des Cocktails | Bar du Casino',
    description: 'Découvrez notre sélection de cocktails classiques et signatures avec recettes détaillées, ingrédients et instructions de préparation.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Carte des Cocktails | Bar du Casino',
    description: 'Découvrez notre sélection de cocktails classiques et signatures avec recettes détaillées, ingrédients et instructions de préparation.',
  },
};

export default function BarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
