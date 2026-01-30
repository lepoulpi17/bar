import { Construction, Clock } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 inline-flex items-center justify-center">
          <Construction className="h-32 w-32 text-primary animate-pulse" />
        </div>

        <h1 className="text-5xl font-bold mb-4">
          Maintenance en cours
        </h1>

        <p className="text-xl text-muted-foreground mb-8">
          Notre site est actuellement en maintenance pour améliorer votre expérience.
          Nous reviendrons bientôt.
        </p>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <p className="text-sm">
            Merci de votre patience
          </p>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Pour toute urgence, veuillez contacter l'administrateur système.
          </p>
        </div>
      </div>
    </div>
  );
}
