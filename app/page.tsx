import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Wine, BarChart3, Users, Package, TrendingUp, Shield } from 'lucide-react';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wine className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Bar du Casino</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <>
                <Button asChild variant="outline">
                  <Link href="/bar">Carte des cocktails</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/profile">Profil</Link>
                </Button>
                {session.user.role === 'admin' && (
                  <Button asChild>
                    <Link href="/admin">Administration</Link>
                  </Button>
                )}
              </>
            ) : (
              <Button asChild>
                <Link href="/login">Connexion</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Gestion Professionnelle de Bar
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Gérez votre bar avec simplicité
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Une solution complète pour la gestion des cocktails, du stock et des ingrédients.
            Optimisez vos opérations et offrez une expérience exceptionnelle.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/bar">
                <Wine className="mr-2 h-5 w-5" />
                Voir les cocktails
              </Link>
            </Button>
            {session?.user.role === 'admin' && (
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link href="/admin">
                  <Shield className="mr-2 h-5 w-5" />
                  Espace admin
                </Link>
              </Button>
            )}
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Wine className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Carte des cocktails</CardTitle>
              <CardDescription>
                Consultez tous les cocktails disponibles avec leurs recettes détaillées et images
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Package className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Gestion du stock</CardTitle>
              <CardDescription>
                Suivez les niveaux de stock en temps réel avec alertes automatiques et planning de réapprovisionnement
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Statistiques avancées</CardTitle>
              <CardDescription>
                Analysez les tendances, cocktails populaires et optimisez vos coûts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Calcul des coûts</CardTitle>
              <CardDescription>
                Calculez automatiquement le prix de revient de chaque cocktail
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Contrôlez les accès avec des rôles administrateur et employé
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Audit complet</CardTitle>
              <CardDescription>
                Traçabilité complète de toutes les actions avec logs détaillés
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Prêt à commencer ?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Découvrez notre carte de cocktails ou connectez-vous pour accéder aux fonctionnalités avancées.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" variant="default">
              <Link href="/bar">Voir les cocktails</Link>
            </Button>
            {!session && (
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Se connecter</Link>
              </Button>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bar du Casino. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
