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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Wine className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Bar du Casino</h1>
                <p className="text-sm text-muted-foreground">
                  {availableCount} ingrédients • {doableCount} cocktails réalisables
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{session?.user?.email}</span>
              </div>
              {session?.user?.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ingrédients disponibles</CardTitle>
                <CardDescription>Sélectionnez les ingrédients présents au bar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un ingrédient..."
                    value={searchIngredient}
                    onChange={(e) => setSearchIngredient(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
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
                  <Button size="sm" variant="outline" onClick={() => toggleAll(true)} className="flex-1">
                    Tout sélectionner
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleAll(false)} className="flex-1">
                    Tout désélectionner
                  </Button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {Object.entries(groupedIngredients).map(([category, ings]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-sm mb-2 text-slate-700">{category}</h3>
                      <div className="space-y-2">
                        {ings.map(ing => (
                          <div key={ing.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50">
                            <Checkbox
                              checked={ing.barAvailability?.available || false}
                              onCheckedChange={() => toggleIngredient(ing.id, ing.barAvailability?.available || false)}
                            />
                            <span className="text-sm flex-1">{ing.name}</span>
                            {ing.isAlcoholic && (
                              <Badge variant="secondary" className="text-xs">Alcool</Badge>
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

          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cocktails</CardTitle>
                <CardDescription>Trouvez les cocktails réalisables avec les ingrédients disponibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un cocktail..."
                      value={searchCocktail}
                      onChange={(e) => setSearchCocktail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={baseSpiritFilter} onValueChange={setBaseSpiritFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
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
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="doable">Réalisables</TabsTrigger>
                    <TabsTrigger value="almost">Presque</TabsTrigger>
                  </TabsList>

                  <TabsContent value={cocktailMode} className="mt-4">
                    {cocktails.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Wine className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun cocktail trouvé</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {cocktails.map(cocktail => (
                          <Card
                            key={cocktail.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => router.push(`/cocktails/${cocktail.id}`)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{cocktail.name}</CardTitle>
                                  <CardDescription className="text-xs mt-1">
                                    {cocktail.type} • {cocktail.glass}
                                  </CardDescription>
                                </div>
                                {cocktail.isDoable ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {cocktail.baseSpirit && (
                                  <Badge variant="secondary">{cocktail.baseSpirit}</Badge>
                                )}
                                {cocktail.isDoable ? (
                                  <Badge className="bg-green-500">Réalisable</Badge>
                                ) : (
                                  <Badge variant="destructive">Manque {cocktail.missingCount}</Badge>
                                )}
                              </div>
                              {!cocktail.isDoable && cocktail.missingIngredients.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Manque: {cocktail.missingIngredients.join(', ')}
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
