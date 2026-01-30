# Correction du bug de connexion employé

## Problème Identifié

Lorsqu'un employé se connectait, l'application affichait l'erreur suivante :
```
TypeError: p.filter is not a function
```

### Cause du Problème

La page `/bar` (accessible à tous les utilisateurs connectés) utilisait l'API `/api/admin/cocktails` qui est réservée aux administrateurs.

Quand un employé accédait à la page `/bar` :
1. Le code tentait de charger les cocktails depuis `/api/admin/cocktails`
2. L'API retournait `{ error: 'Accès refusé' }` (status 403)
3. Le code client essayait d'utiliser `.filter()` sur cet objet d'erreur au lieu d'un tableau
4. Cela causait le crash de l'application

## Solutions Appliquées

### 1. Correction de `/app/bar/page.tsx`

**Avant :**
```typescript
const loadCocktails = async () => {
  try {
    const res = await fetch('/api/admin/cocktails');
    const data = await res.json();
    setCocktails(data);
  } catch (error) {
    console.error('Erreur chargement cocktails:', error);
  } finally {
    setLoading(false);
  }
};
```

**Après :**
```typescript
const loadCocktails = async () => {
  try {
    const res = await fetch('/api/cocktails');  // ✅ Utilise l'API publique
    if (!res.ok) {
      throw new Error('Erreur lors du chargement');
    }
    const data = await res.json();
    if (Array.isArray(data)) {  // ✅ Vérifie que c'est un tableau
      setCocktails(data);
    }
  } catch (error) {
    console.error('Erreur chargement cocktails:', error);
    setCocktails([]);  // ✅ Initialise avec un tableau vide en cas d'erreur
  } finally {
    setLoading(false);
  }
};
```

### 2. Correction de `/app/admin/cocktails/page.tsx`

Même correction appliquée pour gérer proprement les erreurs API et éviter les crashes.

### 3. Correction des icônes PWA

Le fichier `manifest.json` référençait des icônes PNG inexistantes (`icon-192.png` et `icon-512.png`).
Cela causait des erreurs 404 dans la console.

**Solution :** Utilisation de l'icône SVG existante qui est plus flexible et ne nécessite pas plusieurs tailles.

## APIs Disponibles

### API Publique (tous les utilisateurs connectés)
- `GET /api/cocktails` - Liste tous les cocktails avec leur disponibilité
- `GET /api/cocktails/[id]` - Détails d'un cocktail
- `POST /api/cocktails/[id]/view` - Enregistrer une vue de cocktail
- `GET /api/cocktails/[id]/cost` - Calculer le coût d'un cocktail
- `GET /api/ingredients` - Liste des ingrédients
- `GET /api/bar-availability` - Disponibilité au bar

### API Admin (administrateurs uniquement)
- `GET /api/admin/cocktails` - CRUD complet des cocktails
- `GET /api/admin/ingredients` - CRUD complet des ingrédients
- `GET /api/admin/users` - Gestion des utilisateurs
- `GET /api/admin/stock` - Gestion des stocks
- `GET /api/admin/stats` - Statistiques du système
- Et toutes les autres routes admin...

## Test de la Correction

1. Connectez-vous avec un compte employé
2. Vous devriez être redirigé vers `/bar`
3. La liste des cocktails devrait s'afficher correctement
4. Aucune erreur dans la console

## Permissions

- **Employés** : Accès à `/bar` et `/cocktails/[id]` uniquement
- **Administrateurs** : Accès à tout, y compris `/admin`

Le middleware protège automatiquement les routes admin et redirige les non-administrateurs vers `/bar`.
