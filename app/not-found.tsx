import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Wine } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 inline-block">
          <Wine className="h-24 w-24 text-muted-foreground/20" />
        </div>

        <h1 className="text-9xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          404
        </h1>

        <h2 className="text-3xl font-bold mb-4">
          Page introuvable
        </h2>

        <p className="text-lg text-muted-foreground mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          Retournez à l'accueil ou explorez notre carte de cocktails.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-5 w-5" />
              Retour à l'accueil
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/bar">
              <Wine className="h-5 w-5" />
              Voir les cocktails
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Besoin d'aide ? Contactez votre administrateur système.
          </p>
        </div>
      </div>
    </div>
  );
}
