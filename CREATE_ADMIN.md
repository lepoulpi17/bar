# Créer un Administrateur

## Option 1 : Via le script de seed

Le script de seed crée automatiquement un administrateur :

```bash
npm run db:seed
```

Identifiants créés :
- Email : `admin@casino.com`
- Mot de passe : `admin123`

⚠️ **Changez ce mot de passe en production !**

## Option 2 : Manuellement via Prisma Studio

```bash
npx prisma studio
```

1. Ouvrir le modèle `User`
2. Cliquer sur "Add record"
3. Remplir les champs :
   - `id` : laisser vide (auto-généré)
   - `email` : votre email
   - `passwordHash` : voir ci-dessous
   - `name` : votre nom
   - `role` : `admin`
   - `createdAt` : laisser vide (auto-généré)

### Générer un hash de mot de passe

Créer un fichier `hash-password.js` :

```javascript
const bcrypt = require('bcrypt');

const password = 'VotreMotDePasse';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Exécuter :
```bash
node hash-password.js
```

Copier le hash généré dans le champ `passwordHash`.

## Option 3 : Via SQL direct

```bash
mysql -u root -p casino_bar
```

```sql
-- Générer un hash avec bcrypt n'est pas possible en SQL pur
-- Utiliser l'une des options ci-dessus
```

## Option 4 : Promouvoir un utilisateur existant

Si un employé existe déjà, le promouvoir en admin :

```bash
npx prisma studio
```

1. Ouvrir le modèle `User`
2. Trouver l'utilisateur
3. Changer le champ `role` de `employe` à `admin`
4. Sauvegarder

Ou via SQL :
```sql
UPDATE User SET role = 'admin' WHERE email = 'employe@casino.com';
```

## Vérification

1. Se connecter sur `/login`
2. Vérifier l'accès à `/admin`
3. Le bouton "Admin" doit apparaître dans le header

## Sécurité

- Utilisez des mots de passe forts (min 12 caractères)
- Changez les mots de passe par défaut
- Limitez le nombre d'administrateurs
- Ne partagez jamais les identifiants admin
