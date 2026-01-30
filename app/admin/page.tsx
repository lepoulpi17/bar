'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wine, Package, Martini, Users, ArrowLeft, LogOut, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession();

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
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Administration</h1>
          <p className="text-muted-foreground">Gérez les cocktails, ingrédients et utilisateurs</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                Modifier les rôles et permissions des utilisateurs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
