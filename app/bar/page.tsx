'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wine, Search, LogOut, Settings, User } from 'lucide-react';

type CocktailIngredient = {
  quantity: number | null;
  unit: string | null;
  isOptional: boolean;
  ingredient: {
    id: string;
    name: string;
    category: string;
  };
};

type Cocktail = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  baseSpirit: string | null;
  glass: string;
  method: string;
  garnish: string | null;
  imageUrl: string | null;
  ingredients: CocktailIngredient[];
};

export default function BarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCocktails();
  }, []);

  const loadCocktails = async () => {
    try {
      const res = await fetch('/api/cocktails');
      if (!res.ok) {
        throw new Error('Erreur lors du chargement');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCocktails(data);
      }
    } catch (error) {
      console.error('Erreur chargement cocktails:', error);
      setCocktails([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCocktails = cocktails.filter(cocktail =>
    cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cocktail.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cocktail.baseSpirit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wine className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-500" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-amber-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-xl shadow-md">
                <Wine className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Bar du Casino
                </h1>
                <p className="text-sm text-slate-600">
                  {cocktails.length} cocktails disponibles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 bg-slate-100 rounded-lg">
                <User className="h-4 w-4 text-slate-600" />
                <span className="text-slate-700">{session?.user?.email}</span>
              </div>
              {session?.user?.role === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="hover:bg-amber-50 hover:border-amber-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Card className="mb-6 shadow-xl border-slate-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-block w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></span>
              Rechercher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher un cocktail par nom, type ou base..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-amber-400"
              />
            </div>
          </CardContent>
        </Card>

        {filteredCocktails.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Wine className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Aucun cocktail trouvé</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCocktails.map((cocktail, idx) => (
              <Card
                key={cocktail.id}
                className="hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500 cursor-pointer hover:border-amber-300"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => router.push(`/cocktails/${cocktail.id}`)}
              >
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-slate-900">
                        {cocktail.name}
                      </CardTitle>
                      <CardDescription className="text-sm mt-2">
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            {cocktail.type}
                          </Badge>
                          {cocktail.baseSpirit && (
                            <Badge variant="secondary" className="bg-slate-100">
                              {cocktail.baseSpirit}
                            </Badge>
                          )}
                          <Badge variant="outline">{cocktail.glass}</Badge>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        Ingrédients
                      </h4>
                      <ul className="space-y-1.5">
                        {cocktail.ingredients.map((ing, i) => (
                          <li
                            key={i}
                            className="text-sm text-slate-600 flex items-start gap-2 pl-2"
                          >
                            <span className="text-amber-500 mt-1">•</span>
                            <span className="flex-1">
                              {ing.quantity && ing.unit ? (
                                <span className="font-medium text-slate-700">
                                  {ing.quantity} {ing.unit}
                                </span>
                              ) : ing.quantity ? (
                                <span className="font-medium text-slate-700">{ing.quantity}</span>
                              ) : null}{' '}
                              {ing.ingredient.name}
                              {ing.isOptional && (
                                <span className="text-xs text-slate-400 ml-1">(optionnel)</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {cocktail.method && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          Méthode
                        </h4>
                        <p className="text-sm text-slate-600 pl-2">{cocktail.method}</p>
                      </div>
                    )}

                    {cocktail.garnish && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          Garniture
                        </h4>
                        <p className="text-sm text-slate-600 pl-2">{cocktail.garnish}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
