'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, DollarSign, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CocktailCost {
  id: string;
  name: string;
  totalCost: number | null;
  hasAllCosts: boolean;
}

export default function CostsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cocktails, setCocktails] = useState<any[]>([]);
  const [costs, setCosts] = useState<Map<string, CocktailCost>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedMargin] = useState(3);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/cocktails');
      if (!res.ok) throw new Error();
      const cocktailsData = await res.json();
      setCocktails(cocktailsData);

      const costsMap = new Map<string, CocktailCost>();
      for (const cocktail of cocktailsData) {
        const costRes = await fetch(`/api/cocktails/${cocktail.id}/cost`);
        if (costRes.ok) {
          const costData = await costRes.json();
          costsMap.set(cocktail.id, {
            id: cocktail.id,
            name: cocktail.name,
            totalCost: costData.totalCost,
            hasAllCosts: costData.hasAllCosts,
          });
        }
      }
      setCosts(costsMap);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCocktails = cocktails.filter((cocktail) =>
    cocktail.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCocktails = [...filteredCocktails].sort((a, b) => {
    const costA = costs.get(a.id)?.totalCost || 0;
    const costB = costs.get(b.id)?.totalCost || 0;
    return costB - costA;
  });

  const totalCosts = Array.from(costs.values()).filter((c) => c.totalCost !== null);
  const averageCost =
    totalCosts.length > 0
      ? totalCosts.reduce((sum, c) => sum + (c.totalCost || 0), 0) / totalCosts.length
      : 0;
  const incompleteCosts = Array.from(costs.values()).filter((c) => !c.hasAllCosts).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="h-12 w-12 animate-pulse mx-auto mb-4 text-green-500" />
          <p className="text-muted-foreground">Chargement des coûts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-xl shadow-md">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Analyse des Coûts
                  </h1>
                  <p className="text-sm text-slate-600">
                    Calculez le coût de revient et la rentabilité de vos cocktails
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">Coût moyen par cocktail</p>
                  <p className="text-3xl font-bold text-green-600">
                    {averageCost.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">Cocktails analysés</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {totalCosts.length}/{cocktails.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-700">Coûts incomplets</p>
                  <p className="text-3xl font-bold text-orange-600">{incompleteCosts}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Détail des coûts par cocktail
                </CardTitle>
                <CardDescription className="mt-1">
                  Coût de revient, prix de vente suggéré et marge
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un cocktail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-green-400"
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Cocktail</TableHead>
                    <TableHead className="font-semibold">Coût de revient</TableHead>
                    <TableHead className="font-semibold">Prix suggéré (x{suggestedMargin})</TableHead>
                    <TableHead className="font-semibold">Marge brute</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCocktails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Aucun cocktail trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCocktails.map((cocktail) => {
                      const cost = costs.get(cocktail.id);
                      const totalCost = cost?.totalCost || 0;
                      const suggestedPrice = totalCost * suggestedMargin;
                      const margin = suggestedPrice - totalCost;

                      return (
                        <TableRow
                          key={cocktail.id}
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => router.push(`/cocktails/${cocktail.id}`)}
                        >
                          <TableCell className="font-medium">{cocktail.name}</TableCell>
                          <TableCell>
                            {cost?.totalCost ? (
                              <span className="font-semibold text-slate-900">
                                {cost.totalCost.toFixed(2)} €
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {cost?.totalCost ? (
                              <span className="font-semibold text-green-600">
                                {suggestedPrice.toFixed(2)} €
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {cost?.totalCost ? (
                              <span className="font-semibold text-blue-600">
                                {margin.toFixed(2)} €
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {cost?.hasAllCosts ? (
                              <Badge className="bg-green-500">Complet</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                Incomplet
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {incompleteCosts > 0 && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Coûts incomplets détectés</p>
                    <p className="text-sm text-orange-700 mt-1">
                      {incompleteCosts} cocktail(s) ont des ingrédients sans coût défini. Allez
                      dans la gestion des ingrédients pour définir les coûts unitaires.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/admin/ingredients')}
                      className="mt-3 border-orange-300 hover:bg-orange-100"
                    >
                      Gérer les ingrédients
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
