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
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Plus,
  Minus,
  Settings,
  History,
  AlertTriangle,
  TrendingUp,
  Package,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  FileDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StockExportButton } from '@/components/stock-export-button';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  const getStockPercentage = (stock: Stock): number => {
    if (!stock.maxThreshold) return 100;
    return Math.min((stock.quantity / stock.maxThreshold) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600';
      case 'low':
        return 'text-orange-600';
      default:
        return 'text-green-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'low':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'low':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'low':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
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

  const filteredStocks = stocks.filter((stock) => {
    const query = searchQuery.toLowerCase();
    return (
      stock.ingredient.name.toLowerCase().includes(query) ||
      stock.ingredient.category.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg mx-auto w-fit mb-4">
            <Package className="h-12 w-12 animate-pulse text-white" />
          </div>
          <p className="text-slate-700 font-medium">Chargement des stocks...</p>
        </div>
      </div>
    );
  }

  const criticalCount = stocks.filter((s) => getStockStatus(s) === 'critical').length;
  const lowCount = stocks.filter((s) => getStockStatus(s) === 'low').length;
  const normalCount = stocks.filter((s) => getStockStatus(s) === 'normal').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-md">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Gestion des Stocks
                  </h1>
                  <p className="text-sm text-slate-600">
                    Suivez et gérez vos stocks d'ingrédients en temps réel
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StockExportButton stocks={stocks} />
              <Button
                onClick={() => setShowInitDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau stock
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stocks" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
            <TabsTrigger value="stocks" className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Package className="h-4 w-4" />
              Stocks
            </TabsTrigger>
            <TabsTrigger value="movements" className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-600">Total Ingrédients</p>
                      <p className="text-3xl font-bold text-slate-900">{stocks.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-green-200 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-700">Stocks OK</p>
                      <p className="text-3xl font-bold text-green-600">{normalCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-orange-200 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-orange-700">Stocks Faibles</p>
                      <p className="text-3xl font-bold text-orange-600">{lowCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-red-200 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-700">Stocks Critiques</p>
                      <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl">
                      <XCircle className="h-6 w-6 text-white" />
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
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Vue d'ensemble des stocks
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Gérez les quantités disponibles pour chaque ingrédient
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher un ingrédient ou une catégorie..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-slate-300 focus:border-blue-400"
                    />
                  </div>
                  {searchQuery && (
                    <p className="text-sm text-slate-600 mt-2">
                      {filteredStocks.length} résultat{filteredStocks.length > 1 ? 's' : ''} trouvé{filteredStocks.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {filteredStocks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">
                        {searchQuery ? 'Aucun résultat trouvé' : 'Aucun stock configuré'}
                      </p>
                    </div>
                  ) : (
                    filteredStocks.map((stock) => {
                      const status = getStockStatus(stock);
                      const percentage = getStockPercentage(stock);
                      return (
                        <div
                          key={stock.id}
                          className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${getStatusBgColor(
                            status
                          )}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">{getStatusIcon(status)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-slate-900 text-lg">
                                    {stock.ingredient.name}
                                  </h3>
                                  <Badge variant="secondary" className="text-xs">
                                    {stock.ingredient.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm mb-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-600">Quantité:</span>
                                    <span className={`font-bold text-lg ${getStatusColor(status)}`}>
                                      {stock.quantity} {stock.unit}
                                    </span>
                                  </div>
                                  {stock.minThreshold && (
                                    <div className="flex items-center gap-1 text-slate-600">
                                      <span>Seuil min:</span>
                                      <span className="font-medium">
                                        {stock.minThreshold} {stock.unit}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {stock.maxThreshold && (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs text-slate-600">
                                      <span>Niveau de stock</span>
                                      <span className="font-medium">{Math.round(percentage)}%</span>
                                    </div>
                                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-500 ${getProgressColor(
                                          status
                                        )}`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openMovementDialog(stock, 'restock')}
                                className="gap-1 bg-white hover:bg-green-50 hover:border-green-400 hover:text-green-700"
                              >
                                <Plus className="h-4 w-4" />
                                Ajouter
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openMovementDialog(stock, 'usage')}
                                className="gap-1 bg-white hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700"
                              >
                                <Minus className="h-4 w-4" />
                                Retirer
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openConfigDialog(stock)}
                                className="hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
                <CardTitle className="text-xl flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600" />
                  Historique des mouvements
                </CardTitle>
                <CardDescription className="mt-1">
                  Consultez tous les mouvements de stock enregistrés
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {movements.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Aucun mouvement enregistré</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {movements.map((movement) => {
                      const isPositive = movement.type === 'restock' || movement.type === 'adjustment';
                      return (
                        <div
                          key={movement.id}
                          className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div>
                                {movement.type === 'restock' && (
                                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg">
                                    <Plus className="h-5 w-5 text-white" />
                                  </div>
                                )}
                                {movement.type === 'usage' && (
                                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
                                    <Minus className="h-5 w-5 text-white" />
                                  </div>
                                )}
                                {movement.type === 'waste' && (
                                  <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-lg">
                                    <XCircle className="h-5 w-5 text-white" />
                                  </div>
                                )}
                                {movement.type === 'adjustment' && (
                                  <div className="bg-gradient-to-br from-slate-500 to-slate-600 p-2.5 rounded-lg">
                                    <Settings className="h-5 w-5 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-slate-900">
                                    {movement.stock?.ingredient.name}
                                  </h3>
                                  <Badge
                                    variant={isPositive ? 'default' : 'secondary'}
                                    className={
                                      isPositive
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                        : 'bg-slate-100 text-slate-800'
                                    }
                                  >
                                    {getMovementTypeLabel(movement.type)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <History className="h-3 w-3" />
                                    {new Date(movement.createdAt).toLocaleString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {movement.reason && (
                                    <span className="text-slate-500 italic">
                                      &bull; {movement.reason}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`text-right px-4 py-2 rounded-lg ${
                                isPositive
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-orange-50 text-orange-700'
                              }`}
                            >
                              <span className="text-2xl font-bold">
                                {isPositive ? '+' : '-'}
                                {movement.quantity}
                              </span>
                              <span className="text-sm ml-1">{movement.unit}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {movementType === 'restock' && (
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                  <Plus className="h-6 w-6 text-white" />
                </div>
              )}
              {movementType === 'usage' && (
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl">
                  <Minus className="h-6 w-6 text-white" />
                </div>
              )}
              {movementType === 'waste' && (
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <DialogTitle className="text-xl">
                  {movementType === 'restock' && 'Ajouter du stock'}
                  {movementType === 'usage' && 'Retirer du stock'}
                  {movementType === 'waste' && 'Déclarer une perte'}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedStock?.ingredient.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantité ({selectedStock?.unit})
              </Label>
              <Input
                id="quantity"
                type="number"
                value={movementQuantity}
                onChange={(e) => setMovementQuantity(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="border-slate-300 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Raison (optionnel)
              </Label>
              <Textarea
                id="reason"
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                placeholder="Ex: Réception commande, Cocktail Mojito, Bouteille cassée..."
                className="border-slate-300 focus:border-blue-400 resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setShowMovementDialog(false)}
              className="hover:bg-slate-50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleMovement}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Configuration du stock</DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedStock?.ingredient.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium">
                Unité de mesure
              </Label>
              <Select value={configUnit} onValueChange={setConfigUnit}>
                <SelectTrigger id="unit" className="border-slate-300 focus:border-blue-400">
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
            <div className="space-y-2">
              <Label htmlFor="minThreshold" className="text-sm font-medium">
                Seuil minimum (alerte)
              </Label>
              <Input
                id="minThreshold"
                type="number"
                value={configMinThreshold}
                onChange={(e) => setConfigMinThreshold(e.target.value)}
                placeholder="Ex: 500"
                min="0"
                step="0.01"
                className="border-slate-300 focus:border-blue-400"
              />
              <p className="text-xs text-slate-500">
                Une alerte sera affichée si le stock descend en dessous de cette valeur
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxThreshold" className="text-sm font-medium">
                Seuil maximum (optionnel)
              </Label>
              <Input
                id="maxThreshold"
                type="number"
                value={configMaxThreshold}
                onChange={(e) => setConfigMaxThreshold(e.target.value)}
                placeholder="Ex: 5000"
                min="0"
                step="0.01"
                className="border-slate-300 focus:border-blue-400"
              />
              <p className="text-xs text-slate-500">
                Utilisé pour calculer la barre de progression du niveau de stock
              </p>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfigDialog(false)}
              className="hover:bg-slate-50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdateConfig}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInitDialog} onOpenChange={setShowInitDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Initialiser un nouveau stock</DialogTitle>
                <DialogDescription className="mt-1">
                  Configurez le suivi de stock pour un ingrédient
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient" className="text-sm font-medium">
                Ingrédient <span className="text-red-500">*</span>
              </Label>
              <Select value={initIngredientId} onValueChange={setInitIngredientId}>
                <SelectTrigger id="ingredient" className="border-slate-300 focus:border-blue-400">
                  <SelectValue placeholder="Sélectionner un ingrédient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredientsWithoutStock.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-xs text-slate-500">({ingredient.category})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="init-unit" className="text-sm font-medium">
                  Unité <span className="text-red-500">*</span>
                </Label>
                <Select value={initUnit} onValueChange={setInitUnit}>
                  <SelectTrigger id="init-unit" className="border-slate-300 focus:border-blue-400">
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
              <div className="space-y-2">
                <Label htmlFor="init-quantity" className="text-sm font-medium">
                  Quantité initiale
                </Label>
                <Input
                  id="init-quantity"
                  type="number"
                  value={initQuantity}
                  onChange={(e) => setInitQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="border-slate-300 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="init-min" className="text-sm font-medium">
                  Seuil minimum
                </Label>
                <Input
                  id="init-min"
                  type="number"
                  value={initMinThreshold}
                  onChange={(e) => setInitMinThreshold(e.target.value)}
                  placeholder="Ex: 500"
                  min="0"
                  step="0.01"
                  className="border-slate-300 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="init-max" className="text-sm font-medium">
                  Seuil maximum
                </Label>
                <Input
                  id="init-max"
                  type="number"
                  value={initMaxThreshold}
                  onChange={(e) => setInitMaxThreshold(e.target.value)}
                  placeholder="Ex: 5000"
                  min="0"
                  step="0.01"
                  className="border-slate-300 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                Les seuils permettent de visualiser le niveau de stock et recevoir des alertes automatiques.
              </p>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setShowInitDialog(false)}
              className="hover:bg-slate-50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleInitStock}
              disabled={!initIngredientId}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Initialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
