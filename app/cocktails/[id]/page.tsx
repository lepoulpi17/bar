'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Wine, CheckCircle2, XCircle, Maximize2, Minimize2 } from 'lucide-react';

type CocktailIngredient = {
  id: string;
  quantity: number | null;
  unit: string | null;
  isOptional: boolean;
  ingredient: {
    id: string;
    name: string;
    barAvailability: {
      available: boolean;
    } | null;
  };
};

type Cocktail = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  baseSpirit: string | null;
  glass: string;
  ice: boolean;
  iceType: string | null;
  method: string;
  garnish: string | null;
  imageUrl: string | null;
  ingredients: CocktailIngredient[];
  isDoable: boolean;
  missingCount: number;
  missingIngredients: string[];
};

export default function CocktailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceMode, setServiceMode] = useState(false);

  useEffect(() => {
    loadCocktail();
  }, [params.id]);

  const loadCocktail = async () => {
    try {
      const res = await fetch(`/api/cocktails/${params.id}`);
      const data = await res.json();
      setCocktail(data);
    } catch (error) {
      console.error('Erreur chargement cocktail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Wine className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!cocktail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Cocktail non trouvé</p>
          <Button onClick={() => router.push('/bar')}>Retour au bar</Button>
        </div>
      </div>
    );
  }

  if (serviceMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-bold">{cocktail.name}</h1>
            <Button size="lg" variant="outline" onClick={() => setServiceMode(false)}>
              <Minimize2 className="h-6 w-6" />
            </Button>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-amber-500">Ingrédients</h2>
              <div className="space-y-3">
                {cocktail.ingredients
                  .filter(ci => !ci.isOptional)
                  .map((ci) => (
                    <div key={ci.id} className="flex items-center gap-4 text-2xl">
                      {ci.ingredient.barAvailability?.available ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                      )}
                      <span className="font-semibold">
                        {ci.quantity} {ci.unit}
                      </span>
                      <span>{ci.ingredient.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            <Separator className="bg-slate-700" />

            <div>
              <h2 className="text-3xl font-bold mb-4 text-amber-500">Préparation</h2>
              <div className="space-y-4">
                {cocktail.method.split('\n').map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="bg-amber-500 text-slate-900 font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-xl">
                      {idx + 1}
                    </div>
                    <p className="text-2xl leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {cocktail.garnish && (
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2 text-amber-500">Garniture</h3>
                <p className="text-2xl">{cocktail.garnish}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const requiredIngredients = cocktail.ingredients.filter(ci => !ci.isOptional);
  const optionalIngredients = cocktail.ingredients.filter(ci => ci.isOptional);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/bar')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au bar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {cocktail.imageUrl && (
              <div className="md:w-1/3">
                <img
                  src={cocktail.imageUrl}
                  alt={cocktail.name}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className={cocktail.imageUrl ? 'md:w-2/3' : 'w-full'}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{cocktail.name}</h1>
                  {cocktail.description && (
                    <p className="text-muted-foreground">{cocktail.description}</p>
                  )}
                </div>
                {cocktail.isDoable ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge>{cocktail.type}</Badge>
                {cocktail.baseSpirit && <Badge variant="secondary">{cocktail.baseSpirit}</Badge>}
                <Badge variant="outline">{cocktail.glass}</Badge>
                {cocktail.ice && <Badge variant="outline">Glaçons {cocktail.iceType}</Badge>}
              </div>

              {!cocktail.isDoable && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg mb-6">
                  <p className="font-semibold">Ingrédients manquants ({cocktail.missingCount}) :</p>
                  <p className="text-sm mt-1">{cocktail.missingIngredients.join(', ')}</p>
                </div>
              )}

              <Button size="lg" onClick={() => setServiceMode(true)} className="w-full">
                <Maximize2 className="h-5 w-5 mr-2" />
                Mode Service
              </Button>
            </div>
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Ingrédients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requiredIngredients.map((ci) => (
                  <div key={ci.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      {ci.ingredient.barAvailability?.available ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{ci.ingredient.name}</span>
                    </div>
                    {ci.quantity && (
                      <span className="text-muted-foreground">
                        {ci.quantity} {ci.unit}
                      </span>
                    )}
                  </div>
                ))}
                {optionalIngredients.length > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground font-semibold mt-4">Optionnels :</p>
                    {optionalIngredients.map((ci) => (
                      <div key={ci.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          {ci.ingredient.barAvailability?.available ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="font-medium">{ci.ingredient.name}</span>
                          <Badge variant="secondary" className="text-xs">Optionnel</Badge>
                        </div>
                        {ci.quantity && (
                          <span className="text-muted-foreground">
                            {ci.quantity} {ci.unit}
                          </span>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Méthode de préparation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                {cocktail.method.split('\n').map((step, idx) => (
                  <div key={idx} className="flex gap-3 mb-3">
                    <div className="bg-amber-500 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {cocktail.garnish && (
            <Card>
              <CardHeader>
                <CardTitle>Garniture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{cocktail.garnish}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
