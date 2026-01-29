'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

type Ingredient = {
  id: string;
  name: string;
};

type CocktailIngredient = {
  ingredientId: string;
  ingredientName?: string;
  quantity: number | null;
  unit: string;
  isOptional: boolean;
};

export default function CocktailFormPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Long drink',
    baseSpirit: '',
    glass: '',
    ice: false,
    iceType: '',
    method: '',
    garnish: '',
    imageUrl: '',
    ingredients: [] as CocktailIngredient[],
  });

  useEffect(() => {
    loadIngredients();
    if (!isNew) {
      loadCocktail();
    }
  }, []);

  const loadIngredients = async () => {
    try {
      const res = await fetch('/api/admin/ingredients');
      const data = await res.json();
      setIngredients(data);
    } catch (error) {
      toast.error('Erreur chargement ingrédients');
    }
  };

  const loadCocktail = async () => {
    try {
      const res = await fetch(`/api/admin/cocktails/${params.id}`);
      const data = await res.json();

      setFormData({
        name: data.name,
        description: data.description || '',
        type: data.type,
        baseSpirit: data.baseSpirit || '',
        glass: data.glass,
        ice: data.ice,
        iceType: data.iceType || '',
        method: data.method,
        garnish: data.garnish || '',
        imageUrl: data.imageUrl || '',
        ingredients: data.ingredients.map((ci: any) => ({
          ingredientId: ci.ingredientId,
          ingredientName: ci.ingredient.name,
          quantity: ci.quantity,
          unit: ci.unit || 'cl',
          isOptional: ci.isOptional,
        })),
      });
    } catch (error) {
      toast.error('Erreur chargement cocktail');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();
      if (res.ok) {
        setFormData({ ...formData, imageUrl: data.imageUrl });
        toast.success('Image téléchargée');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { ingredientId: '', quantity: null, unit: 'cl', isOptional: false },
      ],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.ingredients.length === 0) {
      toast.error('Ajoutez au moins un ingrédient');
      return;
    }

    const payload = {
      ...formData,
      description: formData.description || null,
      baseSpirit: formData.baseSpirit || null,
      iceType: formData.iceType || null,
      garnish: formData.garnish || null,
      imageUrl: formData.imageUrl || null,
    };

    try {
      const url = isNew ? '/api/admin/cocktails' : `/api/admin/cocktails/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success(isNew ? 'Cocktail créé' : 'Cocktail modifié');
      router.push('/admin/cocktails');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/admin/cocktails')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux cocktails
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          {isNew ? 'Nouveau cocktail' : 'Modifier le cocktail'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Short drink">Short drink</SelectItem>
                      <SelectItem value="Long drink">Long drink</SelectItem>
                      <SelectItem value="Shot">Shot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseSpirit">Base spiritueuse</Label>
                  <Select value={formData.baseSpirit} onValueChange={(v) => setFormData({ ...formData, baseSpirit: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optionnel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      <SelectItem value="gin">Gin</SelectItem>
                      <SelectItem value="vodka">Vodka</SelectItem>
                      <SelectItem value="rhum">Rhum</SelectItem>
                      <SelectItem value="tequila">Tequila</SelectItem>
                      <SelectItem value="whisky">Whisky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="glass">Verre *</Label>
                  <Input
                    id="glass"
                    value={formData.glass}
                    onChange={(e) => setFormData({ ...formData, glass: e.target.value })}
                    placeholder="Highball, Old fashioned..."
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ice"
                    checked={formData.ice}
                    onCheckedChange={(checked) => setFormData({ ...formData, ice: checked })}
                  />
                  <Label htmlFor="ice">Avec glaçons</Label>
                </div>

                {formData.ice && (
                  <div>
                    <Label htmlFor="iceType">Type de glace</Label>
                    <Select value={formData.iceType} onValueChange={(v) => setFormData({ ...formData, iceType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cubes">Cubes</SelectItem>
                        <SelectItem value="Pilé">Pilé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ingrédients</CardTitle>
                <Button type="button" size="sm" onClick={addIngredient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Select
                        value={ing.ingredientId}
                        onValueChange={(v) => updateIngredient(index, 'ingredientId', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ingrédient..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ingredient) => (
                            <SelectItem key={ingredient.id} value={ingredient.id}>
                              {ingredient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Qté"
                      value={ing.quantity || ''}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || null)}
                      className="w-24"
                    />
                    <Input
                      placeholder="Unité"
                      value={ing.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="w-24"
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ing.isOptional}
                        onCheckedChange={(checked) => updateIngredient(index, 'isOptional', checked)}
                      />
                      <span className="text-xs text-muted-foreground">Opt.</span>
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeIngredient(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Préparation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="method">Méthode *</Label>
                <Textarea
                  id="method"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  rows={6}
                  placeholder="1. Première étape&#10;2. Deuxième étape..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="garnish">Garniture</Label>
                <Input
                  id="garnish"
                  value={formData.garnish}
                  onChange={(e) => setFormData({ ...formData, garnish: e.target.value })}
                  placeholder="Citron, menthe..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/cocktails')}>
              Annuler
            </Button>
            <Button type="submit">
              {isNew ? 'Créer' : 'Modifier'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
