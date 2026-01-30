'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Plus,
  Minus,
  Settings,
  History,
  AlertTriangle,
  TrendingUp,
  Package,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Stock {
  id: string;
  quantity: number;
  unit: string;
  minThreshold: number | null;
  maxThreshold: number | null;
  lastRestockDate: string | null;
  updatedAt: string;
  ingredient: {
    id: string;
    name: string;
    category: string;
  };
  movements: Movement[];
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
}

interface Movement {
  id: string;
  type: string;
  quantity: number;
  unit: string;
  reason: string | null;
  createdAt: string;
  stock?: {
    ingredient: {
      name: string;
    };
  };
}

export default function StockManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [ingredientsWithoutStock, setIngredientsWithoutStock] = useState<Ingredient[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);
  const [movementType, setMovementType] = useState<'restock' | 'usage' | 'waste'>('restock');
  const [movementQuantity, setMovementQuantity] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [configMinThreshold, setConfigMinThreshold] = useState('');
  const [configMaxThreshold, setConfigMaxThreshold] = useState('');
  const [configUnit, setConfigUnit] = useState('ml');
  const [initIngredientId, setInitIngredientId] = useState('');
  const [initQuantity, setInitQuantity] = useState('');
  const [initUnit, setInitUnit] = useState('ml');
  const [initMinThreshold, setInitMinThreshold] = useState('');
  const [initMaxThreshold, setInitMaxThreshold] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stockResponse, movementsResponse] = await Promise.all([
        fetch('/api/admin/stock'),
        fetch('/api/admin/stock/movements'),
      ]);

      if (stockResponse.ok) {
        const data = await stockResponse.json();
        setStocks(data.stocks);
        setIngredientsWithoutStock(data.ingredientsWithoutStock);
      }

      if (movementsResponse.ok) {
        const data = await movementsResponse.json();
        setMovements(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: Stock) => {
    if (!stock.minThreshold) return 'normal';
    if (stock.quantity <= stock.minThreshold) return 'critical';
    if (stock.quantity <= stock.minThreshold * 1.5) return 'low';
    return 'normal';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Critique
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="gap-1 border-orange-500 text-orange-600">
            <AlertTriangle className="h-3 w-3" />
            Faible
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
            OK
          </Badge>
        );
    }
  };

  const handleMovement = async () => {
    if (!selectedStock || !movementQuantity) return;

    try {
      const response = await fetch('/api/admin/stock/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: selectedStock.id,
          type: movementType,
          quantity: parseFloat(movementQuantity),
          unit: selectedStock.unit,
          reason: movementReason || null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Mouvement de stock enregistré',
        });
        setShowMovementDialog(false);
        setMovementQuantity('');
        setMovementReason('');
        fetchData();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'enregistrer le mouvement',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateConfig = async () => {
    if (!selectedStock) return;

    try {
      const response = await fetch(`/api/admin/stock/${selectedStock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minThreshold: configMinThreshold ? parseFloat(configMinThreshold) : null,
          maxThreshold: configMaxThreshold ? parseFloat(configMaxThreshold) : null,
          unit: configUnit,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Configuration mise à jour',
        });
        setShowConfigDialog(false);
        fetchData();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la configuration',
        variant: 'destructive',
      });
    }
  };

  const handleInitStock = async () => {
    if (!initIngredientId) return;

    try {
      const response = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: initIngredientId,
          quantity: initQuantity ? parseFloat(initQuantity) : 0,
          unit: initUnit,
          minThreshold: initMinThreshold ? parseFloat(initMinThreshold) : null,
          maxThreshold: initMaxThreshold ? parseFloat(initMaxThreshold) : null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Stock initialisé',
        });
        setShowInitDialog(false);
        setInitIngredientId('');
        setInitQuantity('');
        setInitMinThreshold('');
        setInitMaxThreshold('');
        fetchData();
      } else {
        throw new Error('Erreur lors de l\'initialisation');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'initialiser le stock',
        variant: 'destructive',
      });
    }
  };

  const openMovementDialog = (stock: Stock, type: 'restock' | 'usage' | 'waste') => {
    setSelectedStock(stock);
    setMovementType(type);
    setShowMovementDialog(true);
  };

  const openConfigDialog = (stock: Stock) => {
    setSelectedStock(stock);
    setConfigMinThreshold(stock.minThreshold?.toString() || '');
    setConfigMaxThreshold(stock.maxThreshold?.toString() || '');
    setConfigUnit(stock.unit);
    setShowConfigDialog(true);
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'restock':
        return 'Réapprovisionnement';
      case 'usage':
        return 'Utilisation';
      case 'waste':
        return 'Perte';
      case 'adjustment':
        return 'Ajustement';
      default:
        return type;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'restock':
        return <Badge className="bg-green-500">+</Badge>;
      case 'usage':
        return <Badge variant="outline">-</Badge>;
      case 'waste':
        return <Badge variant="destructive">-</Badge>;
      case 'adjustment':
        return <Badge variant="secondary">±</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse mx-auto mb-4 text-slate-400" />
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
                <h1 className="text-2xl font-bold">Gestion des Stocks</h1>
                <p className="text-sm text-muted-foreground">
                  Suivez et gérez vos stocks d'ingrédients
                </p>
              </div>
            </div>
            <Button onClick={() => setShowInitDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Initialiser un stock
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stocks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stocks" className="gap-2">
              <Package className="h-4 w-4" />
              Stocks
            </TabsTrigger>
            <TabsTrigger value="movements" className="gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total ingrédients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stocks.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Stocks critiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {stocks.filter((s) => getStockStatus(s) === 'critical').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Stocks faibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {stocks.filter((s) => getStockStatus(s) === 'low').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Liste des stocks</CardTitle>
                <CardDescription>
                  Gérez les quantités disponibles pour chaque ingrédient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingrédient</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Seuil min.</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Aucun stock configuré
                        </TableCell>
                      </TableRow>
                    ) : (
                      stocks.map((stock) => {
                        const status = getStockStatus(stock);
                        return (
                          <TableRow key={stock.id} className={status === 'critical' ? 'bg-red-50' : ''}>
                            <TableCell className="font-medium">
                              {stock.ingredient.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {stock.ingredient.category}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {stock.quantity} {stock.unit}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {stock.minThreshold
                                ? `${stock.minThreshold} ${stock.unit}`
                                : '-'}
                            </TableCell>
                            <TableCell>{getStatusBadge(status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openMovementDialog(stock, 'restock')}
                                  className="gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  Ajouter
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openMovementDialog(stock, 'usage')}
                                  className="gap-1"
                                >
                                  <Minus className="h-3 w-3" />
                                  Retirer
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openConfigDialog(stock)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements">
            <Card>
              <CardHeader>
                <CardTitle>Historique des mouvements</CardTitle>
                <CardDescription>
                  Consultez tous les mouvements de stock enregistrés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Ingrédient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead>Raison</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Aucun mouvement enregistré
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(movement.createdAt).toLocaleString('fr-FR')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {movement.stock?.ingredient.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMovementTypeBadge(movement.type)}
                              <span>{getMovementTypeLabel(movement.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {movement.type === 'restock' || movement.type === 'adjustment'
                              ? '+'
                              : '-'}
                            {movement.quantity} {movement.unit}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {movement.reason || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {movementType === 'restock' && 'Ajouter du stock'}
              {movementType === 'usage' && 'Retirer du stock'}
              {movementType === 'waste' && 'Déclarer une perte'}
            </DialogTitle>
            <DialogDescription>
              {selectedStock?.ingredient.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantité ({selectedStock?.unit})</Label>
              <Input
                type="number"
                value={movementQuantity}
                onChange={(e) => setMovementQuantity(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>Raison (optionnel)</Label>
              <Textarea
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                placeholder="Ex: Réception commande, Cocktail Mojito, Bouteille cassée..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovementDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleMovement}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuration du stock</DialogTitle>
            <DialogDescription>
              {selectedStock?.ingredient.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Unité</Label>
              <Select value={configUnit} onValueChange={setConfigUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">ml (millilitres)</SelectItem>
                  <SelectItem value="cl">cl (centilitres)</SelectItem>
                  <SelectItem value="L">L (litres)</SelectItem>
                  <SelectItem value="g">g (grammes)</SelectItem>
                  <SelectItem value="kg">kg (kilogrammes)</SelectItem>
                  <SelectItem value="unité">unité</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Seuil minimum (alerte)</Label>
              <Input
                type="number"
                value={configMinThreshold}
                onChange={(e) => setConfigMinThreshold(e.target.value)}
                placeholder="Ex: 500"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Une alerte sera affichée si le stock descend en dessous
              </p>
            </div>
            <div>
              <Label>Seuil maximum (optionnel)</Label>
              <Input
                type="number"
                value={configMaxThreshold}
                onChange={(e) => setConfigMaxThreshold(e.target.value)}
                placeholder="Ex: 5000"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateConfig}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInitDialog} onOpenChange={setShowInitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initialiser un nouveau stock</DialogTitle>
            <DialogDescription>
              Configurer le suivi de stock pour un ingrédient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ingrédient</Label>
              <Select value={initIngredientId} onValueChange={setInitIngredientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un ingrédient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredientsWithoutStock.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unité</Label>
              <Select value={initUnit} onValueChange={setInitUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">ml (millilitres)</SelectItem>
                  <SelectItem value="cl">cl (centilitres)</SelectItem>
                  <SelectItem value="L">L (litres)</SelectItem>
                  <SelectItem value="g">g (grammes)</SelectItem>
                  <SelectItem value="kg">kg (kilogrammes)</SelectItem>
                  <SelectItem value="unité">unité</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantité initiale (optionnel)</Label>
              <Input
                type="number"
                value={initQuantity}
                onChange={(e) => setInitQuantity(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>Seuil minimum</Label>
              <Input
                type="number"
                value={initMinThreshold}
                onChange={(e) => setInitMinThreshold(e.target.value)}
                placeholder="Ex: 500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>Seuil maximum (optionnel)</Label>
              <Input
                type="number"
                value={initMaxThreshold}
                onChange={(e) => setInitMaxThreshold(e.target.value)}
                placeholder="Ex: 5000"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInitDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleInitStock}>Initialiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
