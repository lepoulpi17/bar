'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

type Cocktail = {
  id: string;
  name: string;
  type: string;
  baseSpirit: string | null;
  glass: string;
  ingredients: any[];
};

export default function AdminCocktailsPage() {
  const router = useRouter();
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCocktails();
  }, []);

  const loadCocktails = async () => {
    try {
      const res = await fetch('/api/admin/cocktails');
      const data = await res.json();
      setCocktails(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des cocktails');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cocktail ?')) return;

    try {
      const res = await fetch(`/api/admin/cocktails/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error();
      toast.success('Cocktail supprimé');
      loadCocktails();
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
            <h1 className="text-3xl font-bold">Gestion des cocktails</h1>
            <p className="text-muted-foreground">{cocktails.length} cocktails</p>
          </div>
          <Button onClick={() => router.push('/admin/cocktails/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau cocktail
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold">Nom</th>
                    <th className="text-left p-4 font-semibold">Type</th>
                    <th className="text-left p-4 font-semibold">Base</th>
                    <th className="text-left p-4 font-semibold">Verre</th>
                    <th className="text-left p-4 font-semibold">Ingrédients</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cocktails.map((cocktail) => (
                    <tr key={cocktail.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-medium">{cocktail.name}</td>
                      <td className="p-4">
                        <Badge variant="secondary">{cocktail.type}</Badge>
                      </td>
                      <td className="p-4">{cocktail.baseSpirit || '-'}</td>
                      <td className="p-4">{cocktail.glass}</td>
                      <td className="p-4">{cocktail.ingredients.length}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/cocktails/${cocktail.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/admin/cocktails/${cocktail.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(cocktail.id)}>
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
