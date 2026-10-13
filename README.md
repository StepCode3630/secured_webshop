# Secured Webshop

Projet pédagogique réalisé dans le cadre du cours **183 - Sécurité des applications** (ETML).

Ce dépôt correspond à une application web e-commerce de base sur laquelle la partie **sécurité** a été renforcée et documentée. La logique métier de base (pages, profils, administration, etc.) n’est pas le cœur de ce travail : l’objectif principal du projet est d’implémenter et d’expliciter les bonnes pratiques de sécurisation d’une application web Node.js / Express.

---

## 1. Contexte du projet

Le projet part d’un webshop fonctionnel existant, puis l’implémentation se concentre sur les points suivants :

- sécurisation des identifiants via un hash robuste
- protection contre les injections SQL
- gestion des sessions avec JWT et cookies sécurisés
- restriction d’accès selon les rôles
- politique de mot de passe
- limitation des tentatives de connexion
- mise en place du HTTPS
- protection contre les attaques de type honeypot / accès admin non autorisé
- réduction des fuites d’informations côté erreurs

La partie sécurité est donc au centre du développement, tandis que le front et la base fonctionnelle ont été utilisés comme support applicatif.

---

## 2. Stack technique

- Node.js + Express
- MySQL
- Docker + docker-compose
- Argon2id pour le hachage des mots de passe
- JWT (JOSE) pour l’authentification
- Cookie parser
- Express rate limit
- HTTPS avec certificats locaux
- HTML / JS côté client

---

## 3. Prérequis

- Docker Desktop / Docker Engine
- Node.js 18+ recommandé
- npm

---

## 4. Installation et démarrage

### Étape 1 : configurer les variables d’environnement

Copier le fichier d’exemple :

```bash
cp .env.example .env
```

Le fichier contient les variables utiles pour la base de données et la sécurité :

```env
PASSWORD_PEPPER=...
DB_HOST=localhost
DB_PORT=6033
PORT=8080
DB_USER=db_user
DB_PASS=db_password
DB_NAME=webshop
JWT_SECRET=...
JWT_EXPIRES_IN=20m
```

> Le secret JWT et le pepper doivent rester confidentiels. En production, ils doivent être stockés de manière sécurisée et non versionnés.

### Étape 2 : démarrer la base de données

```bash
docker-compose up
```

Cela lance :

- MySQL sur le port `6033`
- phpMyAdmin sur le port `8081`
- exécution automatique du script SQL de préparation dans `app/db/init/init.sql`

### Étape 3 : lancer l’application

```bash
cd app
npm install
npm start
```

L’application démarre sur :

- https://localhost:8080

> Le projet utilise des certificats HTTPS auto-signés. Le navigateur peut afficher un avertissement de sécurité. Il est normal dans un environnement de développement local.

---

## 5. Accès disponibles

### Pages de l’application

| URL | Description |
|-----|-------------|
| https://localhost:8080/ | Page d’accueil |
| https://localhost:8080/login | Connexion |
| https://localhost:8080/register | Inscription |
| https://localhost:8080/profile | Profil utilisateur |
| https://localhost:8080/admin | Zone d’administration |

### Outils

| Service | URL | Identifiants |
|---------|-----|--------------|
| phpMyAdmin | http://localhost:8081 | `db_user` / `db_password` |

---

## 6. API principale

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/register` | Inscription |
| GET | `/api/profile` | Lecture du profil |
| POST | `/api/profile` | Mise à jour du profil |
| POST | `/api/profile/photo` | Upload de photo |
| GET | `/api/admin/users` | Liste des utilisateurs (admin) |

---

## 7. Sécurité mise en place

### 7.1 Hachage des mots de passe

- Utilisation de **Argon2id**, un algorithme moderne et robuste
- Ajout d’un **pepper** supplémentaire pour renforcer le hachage
- Les fonctions de hashage et de vérification sont centralisées dans le service d’authentification

### 7.2 Protection contre l’injection SQL

- Remplacement des requêtes dynamiques par des **requêtes préparées**
- Utilisation des placeholders `?` avec les valeurs transmises séparément
- Cela empêche une injection SQL via des entrées utilisateur

### 7.3 Authentification JWT

- Création d’un token JWT lors de la connexion
- Stockage du token dans un **cookie HttpOnly**
- Vérification du token au niveau du middleware d’authentification
- Ajout d’un contrôle de rôle pour les routes sensibles

### 7.4 Protection des routes admin

- Middleware `authenticateToken` pour vérifier l’authenticité du token
- Middleware `adminOnly` pour restreindre l’accès aux comptes ayant le rôle `admin`
- Les routes d’administration ne sont accessibles qu’aux utilisateurs autorisés

### 7.5 Politique de mot de passe

- Validation côté backend des mots de passe selon des critères minimaux
- Contrôle de la longueur et de la présence de :
  - minuscule
  - majuscule
  - chiffre

### 7.6 Limitation des tentatives de connexion

- Mise en place de `express-rate-limit`
- Limite le nombre de tentatives de connexion sur une fenêtre de 1 minute
- Permet de réduire les attaques par force brute

### 7.7 HTTPS

- Activation de HTTPS côté serveur
- Utilisation de certificats locaux générés pour le développement

### 7.8 Honeypot / piège admin

- Création de routes ou pages factices destinées à attirer les tentatives d’accès non autorisées
- Log des accès suspects afin de surveiller les comportements anormaux

### 7.9 Gestion des erreurs

- Les messages d’erreur renvoyés sont volontairement minimisés pour éviter des fuites d’information
- Un middleware global capture les erreurs inattendues pour empêcher un crash brutale de l’application

### 7.10 Chiffrement des données sensibles

Le rapport mentionne aussi une piste de chiffrement des données sensibles avec `crypto` et AES. Cette partie est présentée comme un travail complémentaire / non finalisé dans le dossier, et ne doit pas être considérée comme un état de production totalement validé.

---

## 8. Comptes de démonstration

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@webshop.com | admin123 | admin |
| alice@webshop.com | password1 | user |

> Ces identifiants sont destinés au projet pédagogique et au test local. La sécurité réelle d’un environnement de production impose un stockage sécurisé des comptes et des secrets.

---

## 9. Structure du projet

```text
.
├── .env.example
├── docker-compose.yml
├── nodejs.dockerfile
├── app/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── public/
│   ├── routes/
│   ├── services/
│   ├── views/
│   ├── package.json
│   └── server.js
├── doc/
│   └── Rapport_183-webshop_Patricny-Stepan.md
└── README.md
```

---

## 10. Remarque importante

Ce README se concentre sur la partie **sécurisation du projet**. Le socle applicatif de base a été utilisé comme support, mais la valeur ajoutée principale de ce dépôt est la mise en œuvre des mécanismes de sécurité décrits dans le rapport.

---

## 11. Références

Le rapport détaillé du projet est disponible dans :

- `doc/Rapport_183-webshop_Patricny-Stepan.md`

Il décrit précisément les étapes de sécurisation, les choix techniques et les conclusions du travail réalisé.
