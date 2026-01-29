# Bar du Casino - Application de Gestion de Cocktails

Application web responsive pour la gestion du bar d'un casino. Permet aux employés de visualiser les cocktails réalisables en fonction des ingrédients disponibles, et aux administrateurs de gérer le catalogue complet.

## Stack Technique

- **Framework**: Next.js 13+ (App Router)
- **Base de données**: MySQL via Prisma ORM
- **Authentification**: NextAuth.js avec provider Credentials
- **Langue**: Interface 100% en français
- **Style**: TailwindCSS + shadcn/ui

## Fonctionnalités

### Pour les Employés
- Sélection des ingrédients disponibles au bar
- Visualisation des cocktails réalisables
- Filtrage par type d'alcool et recherche
- Vue détaillée avec mode service (grande police)
- Indication des ingrédients manquants

### Pour les Administrateurs
- Gestion complète des cocktails (CRUD)
- Gestion des ingrédients (CRUD)
- Gestion des utilisateurs et rôles
- Upload d'images pour les cocktails
- Tableau de bord admin

## Prérequis

- Node.js 18+
- MySQL 8+
- npm ou yarn

## Installation Locale

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd casino-bar
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL="mysql://user:password@localhost:3306/casino_bar"
NEXTAUTH_SECRET="votre-secret-aleatoire-tres-long-et-securise"
NEXTAUTH_URL="http://localhost:3000"
```

**Générer un secret NextAuth** :
```bash
openssl rand -base64 32
```

### 4. Créer la base de données MySQL

```sql
CREATE DATABASE casino_bar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Exécuter les migrations Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Peupler la base de données

```bash
npm run db:seed
```

Cela créera :
- Un administrateur : `admin@casino.com` / `admin123`
- Un employé : `employe@casino.com` / `employe123`
- ~25 ingrédients de base
- 10 cocktails classiques

### 7. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Déploiement sur VPS

### 1. Préparer le VPS

Installer Node.js et MySQL :

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server
```

### 2. Configurer MySQL

```bash
sudo mysql_secure_installation
sudo mysql -u root -p
```

```sql
CREATE DATABASE casino_bar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'casino_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON casino_bar.* TO 'casino_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Déployer l'application

```bash
# Cloner le projet
cd /var/www
sudo git clone <votre-repo> casino-bar
cd casino-bar

# Installer les dépendances
sudo npm install

# Créer le fichier .env
sudo nano .env
```

Contenu du fichier `.env` :

```env
DATABASE_URL="mysql://casino_user:mot_de_passe_securise@localhost:3306/casino_bar"
NEXTAUTH_SECRET="votre-secret-genere-avec-openssl"
NEXTAUTH_URL="https://votre-domaine.com"
NODE_ENV="production"
```

```bash
# Générer Prisma Client
sudo npx prisma generate

# Exécuter les migrations
sudo npx prisma migrate deploy

# Peupler la base
sudo npm run db:seed

# Build de production
sudo npm run build

# Créer le dossier uploads
sudo mkdir -p public/uploads
sudo chmod 755 public/uploads
```

### 4. Configurer PM2 (Process Manager)

```bash
# Installer PM2
sudo npm install -g pm2

# Démarrer l'application
pm2 start npm --name "casino-bar" -- start

# Configurer le démarrage automatique
pm2 startup
pm2 save
```

### 5. Configurer Nginx (Reverse Proxy)

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/casino-bar
```

Configuration Nginx :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/casino-bar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configurer SSL avec Let's Encrypt (Optionnel mais recommandé)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## Commandes Utiles

```bash
# Développement
npm run dev                 # Serveur de développement
npm run build              # Build de production
npm start                  # Démarrer en production

# Base de données
npx prisma studio          # Interface graphique Prisma
npx prisma migrate dev     # Créer une migration
npx prisma migrate deploy  # Appliquer les migrations en prod
npm run db:seed            # Peupler la base

# PM2 (Production)
pm2 status                 # Statut des processus
pm2 restart casino-bar     # Redémarrer l'app
pm2 logs casino-bar        # Voir les logs
pm2 monit                  # Monitoring
```

## Structure du Projet

```
casino-bar/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── admin/             # Routes admin (CRUD)
│   │   ├── ingredients/       # Liste ingrédients
│   │   ├── cocktails/         # Liste cocktails
│   │   └── bar-availability/  # Gestion disponibilité
│   ├── admin/                  # Interface admin
│   ├── bar/                    # Interface employé
│   ├── cocktails/             # Détail cocktail
│   ├── login/                 # Page de connexion
│   └── layout.tsx
├── components/
│   └── ui/                    # Composants shadcn/ui
├── lib/
│   ├── auth.ts                # Configuration NextAuth
│   ├── prisma.ts              # Client Prisma
│   └── utils.ts               # Utilitaires
├── prisma/
│   ├── schema.prisma          # Schéma de la base
│   └── seed.ts                # Script de peuplement
├── public/
│   └── uploads/               # Images uploadées
├── middleware.ts              # Protection des routes
└── .env                       # Variables d'environnement
```

## Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Protection CSRF via NextAuth
- Validation des données avec Zod
- Upload sécurisé (types et taille limités)
- Middleware de protection des routes
- Vérification des rôles côté serveur

## Comptes par Défaut

Après le seed :

**Administrateur**
- Email : `admin@casino.com`
- Mot de passe : `admin123`

**Employé**
- Email : `employe@casino.com`
- Mot de passe : `employe123`

⚠️ **IMPORTANT** : Changez ces mots de passe en production !

## Maintenance

### Backup de la base de données

```bash
mysqldump -u casino_user -p casino_bar > backup_$(date +%Y%m%d).sql
```

### Restauration

```bash
mysql -u casino_user -p casino_bar < backup_20240101.sql
```

### Mise à jour

```bash
cd /var/www/casino-bar
sudo git pull
sudo npm install
sudo npx prisma migrate deploy
sudo npm run build
pm2 restart casino-bar
```

## Support & Troubleshooting

### Problème de connexion à la base

Vérifier que MySQL est démarré :
```bash
sudo systemctl status mysql
```

Tester la connexion :
```bash
npx prisma db pull
```

### Erreur de permission sur uploads

```bash
sudo chown -R www-data:www-data public/uploads
sudo chmod -R 755 public/uploads
```

### L'application ne démarre pas

Vérifier les logs :
```bash
pm2 logs casino-bar
```

Vérifier le port 3000 :
```bash
sudo lsof -i :3000
```

## Licence

Projet propriétaire - Tous droits réservés

## Auteur

Développé pour le Bar du Casino
