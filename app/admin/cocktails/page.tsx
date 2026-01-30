'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

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

export default function AdminCocktailsPage() {
  const router = useRouter();
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCocktails();
  }, []);

  const loadCocktails = async () => {
    try {
      const res = await fetch('/api/admin/cocktails');
      const data = await res.json();
      setCocktails(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des cocktails');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cocktail ?')) return;

    try {
      const res = await fetch(`/api/admin/cocktails/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error();
      toast.success('Cocktail supprimé');
      loadCocktails();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredCocktails = cocktails.filter(cocktail =>
    cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cocktail.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cocktail.baseSpirit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestion des cocktails</h1>
            <p className="text-muted-foreground">{cocktails.length} cocktails</p>
          </div>
          <Button onClick={() => router.push('/admin/cocktails/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau cocktail
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rechercher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher un cocktail par nom, type ou base..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCocktails.map((cocktail) => (
            <Card key={cocktail.id} className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{cocktail.name}</CardTitle>
                    <CardDescription className="text-sm mt-2">
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {cocktail.type}
                        </Badge>
                        {cocktail.baseSpirit && (
                          <Badge variant="secondary">{cocktail.baseSpirit}</Badge>
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
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Ingrédients</h4>
                    <ul className="space-y-1.5">
                      {cocktail.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
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
                      <h4 className="font-semibold text-sm text-slate-700 mb-1">Méthode</h4>
                      <p className="text-sm text-slate-600">{cocktail.method}</p>
                    </div>
                  )}

                  {cocktail.garnish && (
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-1">Garniture</h4>
                      <p className="text-sm text-slate-600">{cocktail.garnish}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/cocktails/${cocktail.id}`)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(cocktail.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCocktails.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium">Aucun cocktail trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
