'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Martini, Users, ArrowLeft, LogOut, BarChart3, Activity, Settings, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Stats {
  overview: {
    totalCocktails: number;
    totalIngredients: number;
    totalUsers: number;
    lowStockCount: number;
    totalStockValue: number;
    availableIngredientsCount: number;
  };
  stockAlerts: Array<{
    id: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    minThreshold: number;
  }>;
  movementsByDay: Array<{
    date: string;
    restocks: number;
    usage: number;
    waste: number;
    total: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    userEmail: string;
    entityName: string;
    createdAt: string;
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
                  <CardDescription>Cocktails</CardDescription>
                  <CardTitle className="text-3xl">{stats.overview.totalCocktails}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Recettes dans le catalogue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Ingrédients</CardDescription>
                  <CardTitle className="text-3xl">{stats.overview.totalIngredients}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {stats.overview.availableIngredientsCount} disponibles au bar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Utilisateurs</CardDescription>
                  <CardTitle className="text-3xl">{stats.overview.totalUsers}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Comptes actifs
                  </p>
                </CardContent>
              </Card>

              <Card className={stats.overview.lowStockCount > 0 ? "border-amber-500/50" : ""}>
                <CardHeader className="pb-2">
                  <CardDescription>Stock</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {stats.overview.lowStockCount}
                    {stats.overview.lowStockCount > 0 && (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Alertes de stock bas
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stats.movementsByDay && stats.movementsByDay.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Mouvements de stock
                    </CardTitle>
                    <CardDescription>Activité sur les 30 derniers jours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.movementsByDay}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => {
                            const d = new Date(date);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                          }}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip
                          labelFormatter={(label) => {
                            const d = new Date(label);
                            return d.toLocaleDateString('fr-FR');
                          }}
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                        />
                        <Legend />
                        <Bar dataKey="restocks" name="Réappro." fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="usage" name="Utilisation" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="waste" name="Perte" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {stats.recentActivity && stats.recentActivity.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Activité récente
                    </CardTitle>
                    <CardDescription>Dernières actions effectuées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                            <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.entityName}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.action.replace(/_/g, ' ')} · {activity.userEmail}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push('/admin/logs')}
                    >
                      Voir tout le journal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {stats.stockAlerts.length > 0 && (
              <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                    <AlertTriangle className="h-5 w-5" />
                    Alertes de stock
                  </CardTitle>
                  <CardDescription>Ingrédients nécessitant un réapprovisionnement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.stockAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border">
                        <div>
                          <p className="font-medium">{alert.ingredientName}</p>
                          <p className="text-sm text-muted-foreground">
                            Seuil minimum: {alert.minThreshold} {alert.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600 dark:text-amber-500">
                            {Number(alert.quantity).toFixed(0)} {alert.unit}
                          </p>
                          <p className="text-xs text-muted-foreground">restant</p>
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
                      Voir toutes les alertes ({stats.stockAlerts.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Modules de Gestion</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-amber-500"
            onClick={() => router.push('/admin/cocktails')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-500 p-2.5 rounded-lg">
                  <Martini className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Cocktails</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Recettes et compositions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-emerald-500"
            onClick={() => router.push('/admin/ingredients')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-500 p-2.5 rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Ingrédients</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Catalogue et tarification
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-blue-500"
            onClick={() => router.push('/admin/stock')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-500 p-2.5 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Stocks</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Inventaire et mouvements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-cyan-500"
            onClick={() => router.push('/admin/restock')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-cyan-500 p-2.5 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Réappro.</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Planning fournisseurs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-green-500"
            onClick={() => router.push('/admin/costs')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-500 p-2.5 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Rentabilité</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Analyse des coûts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-slate-500"
            onClick={() => router.push('/admin/users')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-500 p-2.5 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Utilisateurs</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Comptes et accès
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-slate-600"
            onClick={() => router.push('/admin/logs')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-600 p-2.5 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Audit</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Journal d'activité
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-orange-500"
            onClick={() => router.push('/admin/settings')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-500 p-2.5 rounded-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Paramètres</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Configuration système
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
