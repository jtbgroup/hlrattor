# hlrattor - Setup Docker Complet

Environnement de développement et production simplifié avec **H2** (embedded) et **PostgreSQL** (optionnel).

## 📋 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│              DÉVELOPPEMENT (Docker + H2)                     │
├─────────────────────────────────────────────────────────────┤
│  🔧 Spring Boot (port 8081) + 🎨 Angular (port 4200)       │
│  📡 Nginx reverse proxy (port 8080)                         │
│  💾 H2 in-memory database                                   │
│  🔄 Hot reload on save                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            PRODUCTION (Docker - 1 Service)                   │
├─────────────────────────────────────────────────────────────┤
│  📦 App Container = Backend + Frontend + Nginx              │
│  💾 Base de données: H2 ou PostgreSQL (externe)             │
│  🔐 Production-ready image                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Démarrage rapide

### Développement (H2 + Hot reload)

```bash
# Une seule commande !
make dev-start

# Accès
- App:              http://localhost:8080
- Angular direct:   http://localhost:4200
- Backend direct:   http://localhost:8081
- Remote Debug:     localhost:5005
```

**Arrêt:**
```bash
make dev-down
```

---

### Production - Option 1 : H2 (Base de données embarquée)

```bash
make prod-h2

# Accès
- App: http://localhost:8090
```

**Parfait pour tester l'image de production sans PostgreSQL.**

---

### Production - Option 2 : PostgreSQL (Base de données externe)

```bash
# 1. Créer .env depuis template
cp .env.example .env

# 2. Éditer .env avec vos paramètres PostgreSQL
# DB_PROFILE=postgres
# DB_HOST=your_postgres_host
# DB_PASSWORD=your_password

# 3. Démarrer
make prod-postgres

# Accès
- App:        http://localhost:8090
- PostgreSQL: localhost:5432
```

**Arrêt:**
```bash
make prod-down
```

---

## 📁 Structure des fichiers

```
project/
├── Dockerfile              # Production multi-stage
├── Dockerfile.dev          # Développement (H2 + hot reload)
├── docker-compose.yml      # Production (H2 ou PostgreSQL)
├── docker-compose.dev.yml  # Développement
├── docker/
│   ├── nginx.dev.conf      # Nginx dev reverse proxy
│   ├── nginx.prod.conf     # Nginx prod reverse proxy
│   ├── supervisord.dev.conf # Gestion 3 services (dev)
│   └── entrypoint.sh       # Script de démarrage (prod)
├── .env.example            # Configuration example
├── Makefile                # Commandes simplifiées
├── backend/                # Spring Boot code
├── frontend/               # Angular code
└── VERSION                 # Version du projet
```

---

## 🔧 Variables d'environnement

### Développement (docker-compose.dev.yml)
Automatique avec H2 - aucune configuration nécessaire.

### Production (docker-compose.yml)

```env
# Profil base de données
DB_PROFILE=h2              # ou 'postgres'

# PostgreSQL (si DB_PROFILE=postgres)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hlrattor
DB_USER=hlrattor
DB_PASSWORD=secure_password

# JVM tuning (optionnel)
JAVA_OPTS="-Xmx1024m -Xms512m"
```

---

## 📊 Commandes disponibles

```bash
# DÉVELOPPEMENT
make dev-start          # Démarrer l'environnement dev
make dev-down           # Arrêter
make dev-logs           # Voir les logs
make dev-clean          # Supprimer volumes (⚠️)

# PRODUCTION
make prod-h2            # Avec H2 embedded
make prod-postgres      # Avec PostgreSQL
make prod-down          # Arrêter
make prod-logs          # Voir les logs

# UTILITAIRES
make init               # Initialiser le projet
make quality            # Vérifications code
make set-version V=1.0.0 # Mettre à jour version
make help               # Afficher cette aide
```

---

## 🐛 Debug en développement

### Remote Debugging
- **Host:** `localhost`
- **Port:** `5005`
- Configure dans votre IDE (IntelliJ, VS Code, Eclipse)

### Logs en direct
```bash
make dev-logs
```

### Accès directs aux services
- Backend logs: `curl http://localhost:8081/actuator/health`
- Angular: `http://localhost:4200`

---

## 📦 Architecture Docker

### Développement (Dockerfile.dev)
**Conteneur unique** avec :
- **Angular** : `npm start` (ng serve with watch)
- **Spring Boot** : `mvn spring-boot:run` (with hot reload)
- **Nginx** : Reverse proxy
- **Supervisord** : Gère les 3 processus

**Avantages:**
- ✅ Hot reload backend + frontend
- ✅ Un seul `docker compose up`
- ✅ H2 in-memory (pas de dépendance externe)

### Production (Dockerfile)
**Conteneur unique** avec :
- **Angular** : Compilé en assets statiques (build prod)
- **Spring Boot** : JAR pré-compilée
- **Nginx** : Serve frontend + reverse proxy backend
- **Entrypoint** : Gère le démarrage Nginx + Spring Boot

**Avantages:**
- ✅ Image optimisée (pas de compilation en prod)
- ✅ Frontend pré-compilé (performance)
- ✅ Support H2 ou PostgreSQL
- ✅ Production-ready

---

## 🔄 Flux de développement

```
1. make dev-start          → Lance les 3 services
2. Modifie backend code    → Hot reload auto (mvn)
3. Modifie frontend code   → Hot reload auto (ng)
4. Accès via http://localhost:8080
5. Test, debug, commit
6. make dev-down           → Arrête tout
```

---

## 🚨 Troubleshooting

### Le build échoue: "failed to read dockerfile"
**Solution:** S'assurer que `Dockerfile.dev` existe à la racine du projet.

### Port déjà utilisé
```bash
# Killer le conteneur
docker compose -f docker-compose.dev.yml down -v

# Ou changer le port dans docker-compose.dev.yml
```

### H2 ne persiste pas entre redémarrages
**C'est normal !** H2 en mode dev est in-memory. Pour persister:
- Utiliser PostgreSQL en production
- Ou configurer H2 en fichier (voir `application-h2.yml`)

### Angular ne recompile pas
Vérifier que `frontend/` est bien monté en volume:
```bash
docker compose -f docker-compose.dev.yml logs angular
```

---

## 📚 Documentation additionnelle

- **Backend**: `backend/README.md` (Spring Boot specifics)
- **Frontend**: `frontend/README.md` (Angular specifics)
- **Architecture**: `doc/architecture/sad.md`

---

## 🎯 Résumé

| | Développement | Production H2 | Production PG |
|---|---|---|---|
| **Commande** | `make dev-start` | `make prod-h2` | `make prod-postgres` |
| **Database** | H2 in-memory | H2 embedded | PostgreSQL |
| **Hot reload** | ✅ Oui | ❌ Non | ❌ Non |
| **Port** | 8080 | 8090 | 8090 |
| **Image size** | Moyen | Petit | Petit |
| **Config DB** | Zéro | Zéro | Via .env |

---

**Happy coding! 🚀**
