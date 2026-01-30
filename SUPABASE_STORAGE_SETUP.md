# Configuration Supabase Storage pour les images

## Création du bucket

Pour que l'upload d'images fonctionne correctement, vous devez créer un bucket dans Supabase Storage :

1. Allez sur votre dashboard Supabase : https://app.supabase.com
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Storage**
4. Cliquez sur **New bucket**
5. Configurez le bucket comme suit :
   - **Name** : `cocktail-images`
   - **Public bucket** : Activé (cochez la case)
   - Cliquez sur **Create bucket**

## Configuration des politiques (RLS)

Une fois le bucket créé, assurez-vous que les politiques d'accès permettent :

### Pour l'upload (INSERT)
- Les admins authentifiés peuvent uploader des images

### Pour la lecture (SELECT)
- Tout le monde peut voir les images (bucket public)

Ces politiques sont généralement configurées automatiquement pour un bucket public.

## Vérification

Une fois le bucket créé, vous pouvez :
1. Aller dans l'admin du site
2. Créer ou modifier un cocktail
3. Uploader une image
4. L'image devrait maintenant s'afficher correctement

Les images sont stockées sur Supabase Storage avec des URLs publiques persistantes.
