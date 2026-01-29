'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Ingredient = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  isAlcoholic: boolean;
  baseSpirit: string | null;
  _count?: {
    cocktailIngredients: number;
  };
};

export default function AdminIngredientsPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    subcategory: string;
    isAlcoholic: boolean;
    baseSpirit: string | undefined;
  }>({
    name: '',
    category: '',
    subcategory: '',
    isAlcoholic: false,
    baseSpirit: undefined,
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const res = await fetch('/api/admin/ingredients');
      const data = await res.json();
      setIngredients(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des ingrédients');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      isAlcoholic: false,
      baseSpirit: undefined,
    });
    setEditingIngredient(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      subcategory: ingredient.subcategory || '',
      isAlcoholic: ingredient.isAlcoholic,
      baseSpirit: ingredient.baseSpirit || undefined,
    });
    setEditingIngredient(ingredient);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      subcategory: formData.subcategory || null,
      baseSpirit: formData.baseSpirit || null,
    };

    try {
      if (editingIngredient) {
        const res = await fetch(`/api/admin/ingredients/${editingIngredient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error();
        toast.success('Ingrédient modifié avec succès');
      } else {
        const res = await fetch('/api/admin/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error();
        toast.success('Ingrédient créé avec succès');
      }

      setDialogOpen(false);
      resetForm();
      loadIngredients();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?')) return;

    try {
      const res = await fetch(`/api/admin/ingredients/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error();
      toast.success('Ingrédient supprimé');
      loadIngredients();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestion des ingrédients</h1>
            <p className="text-muted-foreground">{ingredients.length} ingrédients</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel ingrédient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIngredient ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alcool">Alcool</SelectItem>
                      <SelectItem value="Liqueur">Liqueur</SelectItem>
                      <SelectItem value="Jus">Jus</SelectItem>
                      <SelectItem value="Soft">Soft</SelectItem>
                      <SelectItem value="Sirop">Sirop</SelectItem>
                      <SelectItem value="Garniture">Garniture</SelectItem>
                      <SelectItem value="Bitter">Bitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Sous-catégorie</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAlcoholic"
                    checked={formData.isAlcoholic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAlcoholic: checked })}
                  />
                  <Label htmlFor="isAlcoholic">Contient de l'alcool</Label>
                </div>

                {formData.isAlcoholic && (
                  <div>
                    <Label htmlFor="baseSpirit">Base spiritueuse (optionnel)</Label>
                    <Select value={formData.baseSpirit || "none"} onValueChange={(v) => setFormData({ ...formData, baseSpirit: v === "none" ? undefined : v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        <SelectItem value="gin">Gin</SelectItem>
                        <SelectItem value="vodka">Vodka</SelectItem>
                        <SelectItem value="rhum">Rhum</SelectItem>
                        <SelectItem value="tequila">Tequila</SelectItem>
                        <SelectItem value="whisky">Whisky</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingIngredient ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold">Nom</th>
                    <th className="text-left p-4 font-semibold">Catégorie</th>
                    <th className="text-left p-4 font-semibold">Type</th>
                    <th className="text-left p-4 font-semibold">Base</th>
                    <th className="text-left p-4 font-semibold">Cocktails</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient) => (
                    <tr key={ingredient.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-medium">{ingredient.name}</td>
                      <td className="p-4">
                        <Badge variant="secondary">{ingredient.category}</Badge>
                      </td>
                      <td className="p-4">
                        {ingredient.isAlcoholic ? (
                          <Badge className="bg-red-500">Alcoolisé</Badge>
                        ) : (
                          <Badge variant="outline">Sans alcool</Badge>
                        )}
                      </td>
                      <td className="p-4">{ingredient.baseSpirit || '-'}</td>
                      <td className="p-4">{ingredient._count?.cocktailIngredients || 0}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(ingredient)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(ingredient.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
