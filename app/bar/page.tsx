'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wine, Search, LogOut, Settings, CheckCircle2, AlertCircle, User } from 'lucide-react';

type Ingredient = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  isAlcoholic: boolean;
  baseSpirit: string | null;
  barAvailability: {
    available: boolean;
  } | null;
};

type Cocktail = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  baseSpirit: string | null;
  glass: string;
  imageUrl: string | null;
  missingCount: number;
  missingIngredients: string[];
  isDoable: boolean;
  isAlmost: boolean;
};

export default function BarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [searchIngredient, setSearchIngredient] = useState('');
  const [searchCocktail, setSearchCocktail] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [baseSpiritFilter, setBaseSpiritFilter] = useState('all');
  const [cocktailMode, setCocktailMode] = useState<'all' | 'doable' | 'almost'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    if (ingredients.length > 0) {
      loadCocktails();
    }
  }, [baseSpiritFilter, searchCocktail, cocktailMode]);

  const loadIngredients = async () => {
    try {
      const res = await fetch('/api/ingredients');
      const data = await res.json();
      setIngredients(data);
    } catch (error) {
      console.error('Erreur chargement ingrédients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCocktails = async () => {
    try {
      const params = new URLSearchParams();
      if (searchCocktail) params.append('search', searchCocktail);
      if (baseSpiritFilter !== 'all') params.append('baseSpirit', baseSpiritFilter);
      params.append('mode', cocktailMode);

      const res = await fetch(`/api/cocktails?${params}`);
      const data = await res.json();
      setCocktails(data);
    } catch (error) {
      console.error('Erreur chargement cocktails:', error);
    }
  };

  const toggleIngredient = async (ingredientId: string, currentState: boolean) => {
    const newState = !currentState;

    setIngredients(prev =>
      prev.map(ing =>
        ing.id === ingredientId
          ? { ...ing, barAvailability: { available: newState } }
          : ing
      )
    );

    try {
      await fetch('/api/bar-availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ ingredientId, available: newState }]),
      });
      loadCocktails();
    } catch (error) {
      console.error('Erreur mise à jour disponibilité:', error);
    }
  };

  const toggleAll = async (select: boolean) => {
    const updates = ingredients.map(ing => ({
      ingredientId: ing.id,
      available: select,
    }));

    setIngredients(prev =>
      prev.map(ing => ({ ...ing, barAvailability: { available: select } }))
    );

    try {
      await fetch('/api/bar-availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      loadCocktails();
    } catch (error) {
      console.error('Erreur mise à jour disponibilité:', error);
    }
  };

  const categories = Array.from(new Set(ingredients.map(i => i.category))).sort();
  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchIngredient.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ing.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedIngredients = filteredIngredients.reduce((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = [];
    acc[ing.category].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const availableCount = ingredients.filter(i => i.barAvailability?.available).length;
  const doableCount = cocktails.filter(c => c.isDoable).length;

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
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-lg transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-500">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                <Wine className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Bar du Casino
                </h1>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {availableCount} ingrédients • {doableCount} cocktails réalisables
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-500">
              <div className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 bg-slate-100 rounded-lg">
                <User className="h-4 w-4 text-slate-600" />
                <span className="text-slate-700">{session?.user?.email}</span>
              </div>
              {session?.user?.role === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 hover:scale-105"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 animate-in fade-in slide-in-from-left duration-500">
            <Card className="shadow-xl border-slate-200 hover:shadow-2xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="inline-block w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></span>
                  Ingrédients disponibles
                </CardTitle>
                <CardDescription className="text-slate-600">Sélectionnez les ingrédients présents au bar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors duration-200" />
                  <Input
                    placeholder="Rechercher un ingrédient..."
                    value={searchIngredient}
                    onChange={(e) => setSearchIngredient(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-amber-400 transition-all duration-200 hover:border-amber-300"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="border-slate-200 hover:border-amber-300 transition-colors">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAll(true)}
                    className="flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 hover:scale-105"
                  >
                    Tout sélectionner
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAll(false)}
                    className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 hover:scale-105"
                  >
                    Tout désélectionner
                  </Button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {Object.entries(groupedIngredients).map(([category, ings], idx) => (
                    <div key={category} className="animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                      <h3 className="font-semibold text-sm mb-2 text-slate-800 flex items-center gap-2 px-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {ings.map((ing, ingIdx) => (
                          <div
                            key={ing.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent border border-transparent hover:border-amber-200 transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
                            style={{ animationDelay: `${(idx * 50) + (ingIdx * 20)}ms` }}
                          >
                            <Checkbox
                              checked={ing.barAvailability?.available || false}
                              onCheckedChange={() => toggleIngredient(ing.id, ing.barAvailability?.available || false)}
                              className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                            />
                            <span className="text-sm flex-1 font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                              {ing.name}
                            </span>
                            {ing.isAlcoholic && (
                              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                                Alcool
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-4 animate-in fade-in slide-in-from-right duration-500 delay-150">
            <Card className="shadow-xl border-slate-200 hover:shadow-2xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="inline-block w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></span>
                  Cocktails
                </CardTitle>
                <CardDescription className="text-slate-600">Trouvez les cocktails réalisables avec les ingrédients disponibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors duration-200" />
                    <Input
                      placeholder="Rechercher un cocktail..."
                      value={searchCocktail}
                      onChange={(e) => setSearchCocktail(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-amber-400 transition-all duration-200 hover:border-amber-300"
                    />
                  </div>
                  <Select value={baseSpiritFilter} onValueChange={setBaseSpiritFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] border-slate-200 hover:border-amber-300 transition-colors">
                      <SelectValue placeholder="Base alcool" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes bases</SelectItem>
                      <SelectItem value="gin">Gin</SelectItem>
                      <SelectItem value="vodka">Vodka</SelectItem>
                      <SelectItem value="rhum">Rhum</SelectItem>
                      <SelectItem value="tequila">Tequila</SelectItem>
                      <SelectItem value="whisky">Whisky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs value={cocktailMode} onValueChange={(v) => setCocktailMode(v as any)}>
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      Tous
                    </TabsTrigger>
                    <TabsTrigger
                      value="doable"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      Réalisables
                    </TabsTrigger>
                    <TabsTrigger
                      value="almost"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      Presque
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={cocktailMode} className="mt-6">
                    {cocktails.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 animate-in fade-in duration-500">
                        <Wine className="h-16 w-16 mx-auto mb-4 opacity-20 animate-pulse" />
                        <p className="text-lg font-medium">Aucun cocktail trouvé</p>
                        <p className="text-sm mt-1">Ajustez vos filtres ou sélectionnez plus d'ingrédients</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {cocktails.map((cocktail, idx) => (
                          <Card
                            key={cocktail.id}
                            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-slate-200 group bg-white animate-in fade-in slide-in-from-bottom-2 duration-500"
                            style={{ animationDelay: `${idx * 50}ms` }}
                            onClick={() => router.push(`/cocktails/${cocktail.id}`)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <CardTitle className="text-lg group-hover:text-amber-600 transition-colors duration-200">
                                    {cocktail.name}
                                  </CardTitle>
                                  <CardDescription className="text-xs mt-1 text-slate-600">
                                    {cocktail.type} • {cocktail.glass}
                                  </CardDescription>
                                </div>
                                {cocktail.isDoable ? (
                                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                                ) : (
                                  <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {cocktail.baseSpirit && (
                                  <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 transition-colors">
                                    {cocktail.baseSpirit}
                                  </Badge>
                                )}
                                {cocktail.isDoable ? (
                                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-sm">
                                    Réalisable
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600">
                                    Manque {cocktail.missingCount}
                                  </Badge>
                                )}
                              </div>
                              {!cocktail.isDoable && cocktail.missingIngredients.length > 0 && (
                                <p className="text-xs text-slate-500 mt-3 p-2 bg-orange-50 rounded border border-orange-100">
                                  <span className="font-semibold text-orange-700">Manque:</span> {cocktail.missingIngredients.join(', ')}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
