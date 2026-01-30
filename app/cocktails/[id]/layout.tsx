import { Metadata } from 'next';

type Props = {
  params: { id: string };
};

async function getCocktail(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/cocktails/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching cocktail:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cocktail = await getCocktail(params.id);

  if (!cocktail) {
    return {
      title: 'Cocktail non trouvé',
      description: 'Le cocktail que vous recherchez n\'existe pas ou n\'est plus disponible.',
    };
  }

  const description = cocktail.description
    ? `${cocktail.description.substring(0, 155)}...`
    : `Découvrez la recette complète du ${cocktail.name} avec tous les ingrédients et les étapes de préparation détaillées.`;

  const ingredients = cocktail.ingredients
    ?.filter((ci: any) => !ci.isOptional)
    .map((ci: any) => ci.ingredient.name)
    .join(', ');

  const fullDescription = cocktail.description
    ? `${cocktail.description} | Ingrédients: ${ingredients}`
    : `Recette du ${cocktail.name}. Ingrédients: ${ingredients}. Type: ${cocktail.type}. Verre: ${cocktail.glass}.`;

  return {
    title: cocktail.name,
    description: fullDescription,
    keywords: [
      cocktail.name,
      cocktail.type,
      cocktail.baseSpirit,
      'cocktail',
      'recette',
      'bar',
      ...(ingredients?.split(', ') || []),
    ].filter(Boolean),
    openGraph: {
      title: `${cocktail.name} | Bar du Casino`,
      description: description,
      type: 'article',
      ...(cocktail.imageUrl && {
        images: [
          {
            url: cocktail.imageUrl,
            width: 1200,
            height: 630,
            alt: cocktail.name,
          },
        ],
      }),
      locale: 'fr_FR',
      siteName: 'Bar du Casino',
    },
    twitter: {
      card: cocktail.imageUrl ? 'summary_large_image' : 'summary',
      title: `${cocktail.name} | Bar du Casino`,
      description: description,
      ...(cocktail.imageUrl && { images: [cocktail.imageUrl] }),
      creator: '@barcasino',
    },
    alternates: {
      canonical: `/cocktails/${params.id}`,
    },
  };
}

export default function CocktailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
