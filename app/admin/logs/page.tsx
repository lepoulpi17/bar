'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Activity, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  entityName: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
    role: string;
  } | null;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [filterAction, filterEntity]);

  const loadLogs = async () => {
    try {
      let url = '/api/admin/audit-logs?limit=200';
      if (filterAction !== 'all') url += `&action=${filterAction}`;
      if (filterEntity !== 'all') url += `&entityType=${filterEntity}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      user_created: 'Utilisateur créé',
      user_updated: 'Utilisateur modifié',
      user_deleted: 'Utilisateur supprimé',
      ingredient_created: 'Ingrédient créé',
      ingredient_updated: 'Ingrédient modifié',
      ingredient_deleted: 'Ingrédient supprimé',
      cocktail_created: 'Cocktail créé',
      cocktail_updated: 'Cocktail modifié',
      cocktail_deleted: 'Cocktail supprimé',
      stock_created: 'Stock créé',
      stock_updated: 'Stock modifié',
      stock_deleted: 'Stock supprimé',
      stock_movement: 'Mouvement de stock',
      bar_availability_updated: 'Disponibilité bar',
      login_success: 'Connexion réussie',
      login_failed: 'Connexion échouée',
    };
    return labels[action] || action;
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-500';
    if (action.includes('updated')) return 'bg-blue-500';
    if (action.includes('deleted')) return 'bg-red-500';
    if (action.includes('login_success')) return 'bg-emerald-500';
    if (action.includes('login_failed')) return 'bg-orange-500';
    return 'bg-slate-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse mx-auto mb-4 text-slate-400" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Journal d'audit</h1>
                <p className="text-sm text-muted-foreground">
                  Toutes les actions effectuées sur le système
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtres:</span>
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="user_created">Utilisateur créé</SelectItem>
              <SelectItem value="user_updated">Utilisateur modifié</SelectItem>
              <SelectItem value="user_deleted">Utilisateur supprimé</SelectItem>
              <SelectItem value="stock_movement">Mouvement de stock</SelectItem>
              <SelectItem value="cocktail_created">Cocktail créé</SelectItem>
              <SelectItem value="cocktail_updated">Cocktail modifié</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterEntity} onValueChange={setFilterEntity}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type d'entité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entités</SelectItem>
              <SelectItem value="User">Utilisateur</SelectItem>
              <SelectItem value="Stock">Stock</SelectItem>
              <SelectItem value="Cocktail">Cocktail</SelectItem>
              <SelectItem value="Ingredient">Ingrédient</SelectItem>
            </SelectContent>
          </Select>
          {(filterAction !== 'all' || filterEntity !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterAction('all');
                setFilterEntity('all');
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des actions</CardTitle>
            <CardDescription>
              {logs.length} entrées - Les 200 dernières actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun log trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('fr-FR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {log.userName || log.userEmail || 'Système'}
                          </div>
                          {log.user && (
                            <div className="text-xs text-muted-foreground">
                              {log.user.role}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm">
                          {log.entityName && (
                            <div className="font-medium text-xs mb-1">
                              {log.entityType}: {log.entityName}
                            </div>
                          )}
                          <div className="text-muted-foreground text-xs line-clamp-2">
                            {log.details}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.ipAddress || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
