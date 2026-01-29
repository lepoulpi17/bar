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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top duration-500">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-2xl">
              {cocktail.name}
            </h1>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setServiceMode(false)}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-amber-500 transition-all duration-300 hover:scale-110"
            >
              <Minimize2 className="h-6 w-6" />
            </Button>
          </div>

          <div className="space-y-10">
            <div className="animate-in fade-in slide-in-from-left duration-500">
              <h2 className="text-4xl font-bold mb-6 text-amber-400 flex items-center gap-3">
                <span className="w-2 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
                Ingrédients
              </h2>
              <div className="space-y-4">
                {cocktail.ingredients
                  .filter(ci => !ci.isOptional)
                  .map((ci, idx) => (
                    <div
                      key={ci.id}
                      className="flex items-center gap-5 text-2xl p-5 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-amber-500 transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-left duration-300"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {ci.ingredient.barAvailability?.available ? (
                        <div className="bg-green-500/20 p-2 rounded-full">
                          <CheckCircle2 className="h-9 w-9 text-green-400 flex-shrink-0" />
                        </div>
                      ) : (
                        <div className="bg-red-500/20 p-2 rounded-full">
                          <XCircle className="h-9 w-9 text-red-400 flex-shrink-0" />
                        </div>
                      )}
                      <span className="font-bold text-amber-400 min-w-[120px]">
                        {ci.quantity} {ci.unit}
                      </span>
                      <span className="font-medium">{ci.ingredient.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            <Separator className="bg-slate-700 h-px animate-in fade-in duration-500" />

            <div className="animate-in fade-in slide-in-from-right duration-500 delay-300">
              <h2 className="text-4xl font-bold mb-6 text-amber-400 flex items-center gap-3">
                <span className="w-2 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
                Préparation
              </h2>
              <div className="space-y-5">
                {cocktail.method.split('\n').map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-5 items-start p-5 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-amber-500 transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-right duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-2xl shadow-2xl">
                      {idx + 1}
                    </div>
                    <p className="text-2xl leading-relaxed font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {cocktail.garnish && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border-2 border-amber-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom duration-500 delay-500">
                <h3 className="text-3xl font-bold mb-4 text-amber-400">Garniture</h3>
                <p className="text-2xl font-medium">{cocktail.garnish}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-amber-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 animate-in fade-in slide-in-from-top duration-500">
          <Button
            variant="ghost"
            onClick={() => router.push('/bar')}
            className="hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au bar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom duration-500">
            {cocktail.imageUrl && (
              <div className="md:w-1/3 animate-in fade-in slide-in-from-left duration-500">
                <div className="relative group">
                  <img
                    src={cocktail.imageUrl}
                    alt={cocktail.name}
                    className="w-full h-64 object-cover rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            )}

            <div className={cocktail.imageUrl ? 'md:w-2/3' : 'w-full'}>
              <div className="flex items-start justify-between gap-4 mb-4 animate-in fade-in slide-in-from-right duration-500">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {cocktail.name}
                  </h1>
                  {cocktail.description && (
                    <p className="text-slate-600 text-lg leading-relaxed">{cocktail.description}</p>
                  )}
                </div>
                {cocktail.isDoable ? (
                  <div className="bg-green-100 p-2 rounded-full animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                  </div>
                ) : (
                  <div className="bg-red-100 p-2 rounded-full animate-in zoom-in duration-300">
                    <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-right duration-500 delay-150">
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md">
                  {cocktail.type}
                </Badge>
                {cocktail.baseSpirit && (
                  <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 shadow-md">
                    {cocktail.baseSpirit}
                  </Badge>
                )}
                <Badge variant="outline" className="border-2 border-slate-300 hover:border-amber-400 transition-colors shadow-md">
                  {cocktail.glass}
                </Badge>
                {cocktail.ice && (
                  <Badge variant="outline" className="border-2 border-blue-300 hover:border-blue-400 transition-colors shadow-md">
                    Glaçons {cocktail.iceType}
                  </Badge>
                )}
              </div>

              {!cocktail.isDoable && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 text-orange-900 px-5 py-4 rounded-xl mb-6 shadow-lg animate-in fade-in slide-in-from-right duration-500 delay-300">
                  <p className="font-bold text-lg flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Ingrédients manquants ({cocktail.missingCount})
                  </p>
                  <p className="text-sm mt-2">{cocktail.missingIngredients.join(', ')}</p>
                </div>
              )}

              <Button
                size="lg"
                onClick={() => setServiceMode(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] font-semibold text-lg py-6 animate-in fade-in slide-in-from-right duration-500 delay-500"
              >
                <Maximize2 className="h-5 w-5 mr-2" />
                Mode Service
              </Button>
            </div>
          </div>

          <Separator className="my-8 animate-in fade-in duration-500" />

          <Card className="shadow-xl border-slate-200 hover:shadow-2xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom duration-500 delay-150">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="inline-block w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></span>
                Ingrédients
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {requiredIngredients.map((ci, idx) => (
                  <div
                    key={ci.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-transparent hover:from-amber-50 hover:to-transparent border border-slate-200 hover:border-amber-300 transition-all duration-200 hover:scale-[1.01] animate-in fade-in slide-in-from-left duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      {ci.ingredient.barAvailability?.available ? (
                        <div className="bg-green-100 p-1 rounded-full">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="bg-red-100 p-1 rounded-full">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                      <span className="font-semibold text-slate-800">{ci.ingredient.name}</span>
                    </div>
                    {ci.quantity && (
                      <span className="text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-lg">
                        {ci.quantity} {ci.unit}
                      </span>
                    )}
                  </div>
                ))}
                {optionalIngredients.length > 0 && (
                  <>
                    <p className="text-sm text-slate-600 font-bold mt-6 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                      Optionnels
                    </p>
                    {optionalIngredients.map((ci, idx) => (
                      <div
                        key={ci.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-transparent hover:from-amber-50 hover:to-transparent border border-slate-200 hover:border-amber-300 transition-all duration-200 hover:scale-[1.01] opacity-75 animate-in fade-in slide-in-from-left duration-300"
                        style={{ animationDelay: `${(requiredIngredients.length + idx) * 50}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          {ci.ingredient.barAvailability?.available ? (
                            <div className="bg-green-100 p-1 rounded-full">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="bg-red-100 p-1 rounded-full">
                              <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                          )}
                          <span className="font-semibold text-slate-800">{ci.ingredient.name}</span>
                          <Badge variant="secondary" className="text-xs bg-slate-200">Optionnel</Badge>
                        </div>
                        {ci.quantity && (
                          <span className="text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-lg">
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

          <Card className="shadow-xl border-slate-200 hover:shadow-2xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom duration-500 delay-300">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="inline-block w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></span>
                Méthode de préparation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {cocktail.method.split('\n').map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-transparent hover:from-amber-50 hover:to-transparent border border-slate-200 hover:border-amber-300 transition-all duration-200 hover:scale-[1.01] animate-in fade-in slide-in-from-left duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-lg">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {cocktail.garnish && (
            <Card className="shadow-xl border-amber-200 hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-amber-50 to-white backdrop-blur-sm animate-in fade-in slide-in-from-bottom duration-500 delay-500">
              <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white">
                <CardTitle className="flex items-center gap-2 text-2xl text-amber-900">
                  <span className="inline-block w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></span>
                  Garniture
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-800 font-medium text-lg p-4 bg-white rounded-xl border border-amber-200">
                  {cocktail.garnish}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
