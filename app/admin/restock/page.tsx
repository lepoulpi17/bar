'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RestockSchedule {
  id: string;
  ingredientId: string;
  scheduledDate: string;
  quantity: number;
  unit: string;
  notes: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  ingredient?: {
    name: string;
    category: string;
  };
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
}

export default function RestockSchedulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<RestockSchedule[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('ml');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [schedulesRes, ingredientsRes] = await Promise.all([
        fetch('/api/admin/restock-schedule'),
        fetch('/api/admin/ingredients'),
      ]);

      if (schedulesRes.ok) {
        const data = await schedulesRes.json();
        setSchedules(data);
      }

      if (ingredientsRes.ok) {
        const data = await ingredientsRes.json();
        setIngredients(data);
      }
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

  const handleCreateSchedule = async () => {
    if (!selectedIngredientId || !scheduledDate || !quantity) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/restock-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: selectedIngredientId,
          scheduledDate: new Date(scheduledDate).toISOString(),
          quantity: parseFloat(quantity),
          unit,
          notes: notes || null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Réapprovisionnement planifié',
        });
        setShowDialog(false);
        resetForm();
        loadData();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le planning',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteSchedule = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/restock-schedule/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Réapprovisionnement marqué comme terminé',
        });
        loadData();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) return;

    try {
      const response = await fetch(`/api/admin/restock-schedule/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Planning supprimé',
        });
        loadData();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setSelectedIngredientId('');
    setScheduledDate('');
    setQuantity('');
    setUnit('ml');
    setNotes('');
  };

  const pendingSchedules = schedules.filter((s) => !s.completed);
  const completedSchedules = schedules.filter((s) => s.completed);
  const upcomingSchedules = pendingSchedules.filter(
    (s) => new Date(s.scheduledDate) >= new Date()
  );
  const overdueSchedules = pendingSchedules.filter(
    (s) => new Date(s.scheduledDate) < new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 animate-pulse mx-auto mb-4 text-cyan-500" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2.5 rounded-xl shadow-md">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Planning de Réapprovisionnement
                  </h1>
                  <p className="text-sm text-slate-600">
                    Planifiez et suivez vos commandes fournisseurs
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau planning
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">À venir</p>
                  <p className="text-3xl font-bold text-cyan-600">{upcomingSchedules.length}</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-3 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-700">En retard</p>
                  <p className="text-3xl font-bold text-red-600">{overdueSchedules.length}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-700">Complétés</p>
                  <p className="text-3xl font-bold text-green-600">{completedSchedules.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-600" />
              Planning de réapprovisionnement
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-6">
                <TabsTrigger value="upcoming" className="gap-2">
                  <Clock className="h-4 w-4" />
                  À venir ({upcomingSchedules.length})
                </TabsTrigger>
                <TabsTrigger value="overdue" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  En retard ({overdueSchedules.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Complétés ({completedSchedules.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                {upcomingSchedules.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Aucun réapprovisionnement prévu</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date prévue</TableHead>
                        <TableHead>Ingrédient</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="whitespace-nowrap font-medium">
                            {new Date(schedule.scheduledDate).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{schedule.ingredient?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {schedule.ingredient?.category}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {schedule.quantity} {schedule.unit}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {schedule.notes || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleCompleteSchedule(schedule.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Terminé
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="overdue">
                {overdueSchedules.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Aucun réapprovisionnement en retard</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date prévue</TableHead>
                        <TableHead>Ingrédient</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueSchedules.map((schedule) => (
                        <TableRow key={schedule.id} className="bg-red-50">
                          <TableCell className="whitespace-nowrap font-medium text-red-700">
                            {new Date(schedule.scheduledDate).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{schedule.ingredient?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {schedule.ingredient?.category}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {schedule.quantity} {schedule.unit}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {schedule.notes || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleCompleteSchedule(schedule.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Terminé
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {completedSchedules.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Aucun réapprovisionnement complété</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date prévue</TableHead>
                        <TableHead>Date de complétion</TableHead>
                        <TableHead>Ingrédient</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(schedule.scheduledDate).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {schedule.completedAt
                              ? new Date(schedule.completedAt).toLocaleDateString('fr-FR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{schedule.ingredient?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {schedule.ingredient?.category}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {schedule.quantity} {schedule.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-3 rounded-xl">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Nouveau réapprovisionnement</DialogTitle>
                <DialogDescription className="mt-1">
                  Planifier une commande fournisseur
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient">
                Ingrédient <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un ingrédient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date prévue <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="cl">cl</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="unité">unité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantité <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Fournisseur, numéro de commande, prix..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateSchedule}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
