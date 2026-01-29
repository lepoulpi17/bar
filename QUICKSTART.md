# Démarrage Rapide - Bar du Casino

## Installation en 5 minutes

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
Créer un fichier `.env` :
```env
DATABASE_URL="mysql://user:password@localhost:3306/casino_bar"
NEXTAUTH_SECRET="generer-avec-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Créer la base de données MySQL
```bash
mysql -u root -p
```
```sql
CREATE DATABASE casino_bar;
EXIT;
```

### 4. Initialiser Prisma et peupler la base
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Lancer l'application
```bash
npm run dev
```

Ouvrir http://localhost:3000

## Comptes de test

**Admin**
- Email: admin@casino.com
- Mot de passe: admin123

**Employé**
- Email: employe@casino.com
- Mot de passe: employe123

## Structure des pages

- `/login` - Connexion
- `/bar` - Interface employé (sélection ingrédients + cocktails)
- `/cocktails/[id]` - Détail cocktail avec mode service
- `/admin` - Dashboard admin
- `/admin/cocktails` - Gestion cocktails
- `/admin/ingredients` - Gestion ingrédients
- `/admin/users` - Gestion utilisateurs

## Commandes utiles

```bash
npm run dev          # Développement
npm run build        # Build production
npm start            # Production
npx prisma studio    # Interface graphique DB
npm run db:seed      # Réinitialiser les données
```

## Troubleshooting

**Erreur de connexion MySQL**
```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql

# Redémarrer MySQL si nécessaire
sudo systemctl restart mysql
```

**Erreur Prisma**
```bash
# Régénérer le client
npx prisma generate

# Réappliquer les migrations
npx prisma migrate reset
```

**Port 3000 déjà utilisé**
```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 [PID]
```

## Support

Consulter le README.md pour la documentation complète.
