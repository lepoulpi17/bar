'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wine, Package, Martini, Users, ArrowLeft, LogOut, BarChart3, Activity, TrendingUp, Eye, Settings, AlertTriangle } from 'lucide-react';

interface Stats {
  overview: {
    totalCocktails: number;
    totalIngredients: number;
    totalUsers: number;
    lowStockCount: number;
    totalViews: number;
    recentViews: number;
  };
  popularCocktails: Array<{
    id: string;
    name: string;
    views: number;
  }>;
  stockAlerts: Array<{
    id: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    minThreshold: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/bar')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au bar
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{session?.user?.email}</span>
              <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
                <Users className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Administration</h1>
          <p className="text-muted-foreground">Gérez les cocktails, ingrédients et utilisateurs</p>
        </div>

        {!loading && stats && (
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total cocktails</CardDescription>
                  <CardTitle className="text-3xl">{stats.overview.totalCocktails}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Recettes disponibles
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total ingrédients</CardDescription>
                  <CardTitle className="text-3xl">{stats.overview.totalIngredients}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Dans le catalogue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Vues (7 jours)</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {stats.overview.recentViews}
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Total: {stats.overview.totalViews} vues
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Alertes stock</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {stats.overview.lowStockCount}
                    {stats.overview.lowStockCount > 0 && (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Ingrédients en stock faible
                  </p>
                </CardContent>
              </Card>
            </div>

            {stats.popularCocktails.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Cocktails populaires
                  </CardTitle>
                  <CardDescription>Les 5 cocktails les plus consultés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.popularCocktails.map((cocktail, index) => (
                      <div key={cocktail.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-muted-foreground w-8">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{cocktail.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium">{cocktail.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.stockAlerts.length > 0 && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Alertes de stock bas
                  </CardTitle>
                  <CardDescription>Ingrédients nécessitant un réapprovisionnement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.stockAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                        <div>
                          <p className="font-medium">{alert.ingredientName}</p>
                          <p className="text-sm text-muted-foreground">
                            Seuil: {alert.minThreshold} {alert.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-destructive">
                            {Number(alert.quantity).toFixed(0)} {alert.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {stats.stockAlerts.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push('/admin/stock')}
                    >
                      Voir tous les {stats.stockAlerts.length} alertes
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Gestion</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => router.push('/admin/cocktails')}
          >
            <CardHeader>
              <div className="bg-amber-500 p-3 rounded-lg w-fit mb-3">
                <Martini className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Cocktails</CardTitle>
              <CardDescription>Gérer les recettes de cocktails</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Créer, modifier et supprimer les cocktails du catalogue
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => router.push('/admin/ingredients')}
          >
            <CardHeader>
              <div className="bg-green-500 p-3 rounded-lg w-fit mb-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Ingrédients</CardTitle>
              <CardDescription>Gérer les ingrédients</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ajouter, modifier et supprimer les ingrédients disponibles
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => router.push('/admin/stock')}
          >
            <CardHeader>
              <div className="bg-purple-500 p-3 rounded-lg w-fit mb-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Stocks</CardTitle>
              <CardDescription>Suivre les quantités</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérer les stocks et suivre les mouvements d'ingrédients
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => router.push('/admin/users')}
          >
            <CardHeader>
              <div className="bg-blue-500 p-3 rounded-lg w-fit mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Utilisateurs</CardTitle>
              <CardDescription>Gérer les utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Créer, modifier et supprimer les comptes utilisateurs
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => router.push('/admin/logs')}
          >
            <CardHeader>
              <div className="bg-slate-600 p-3 rounded-lg w-fit mb-3">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Journal d'audit</CardTitle>
              <CardDescription>Consulter les logs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Voir toutes les actions effectuées sur le système
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => router.push('/admin/settings')}
          >
            <CardHeader>
              <div className="bg-orange-500 p-3 rounded-lg w-fit mb-3">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>Configuration système</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mode maintenance et autres paramètres système
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
