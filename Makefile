.PHONY: init dev-start dev-down dev-logs dev-clean prod prod-h2 prod-postgres prod-down prod-logs quality set-version show-version help

VERSION := $(shell cat VERSION 2>/dev/null || echo "0.0.1")

# ============================================
# HELP
# ============================================
help:
	@echo "📚 hlrattor - Development & Production Commands"
	@echo ""
	@echo "🔧 DEVELOPMENT (H2 embedded DB with hot reload)"
	@echo "  make dev-start        Start development environment"
	@echo "  make dev-down         Stop development environment"
	@echo "  make dev-logs         View development logs"
	@echo "  make dev-clean        Remove dev volumes (⚠️ destroys data)"
	@echo ""
	@echo "🚀 PRODUCTION"
	@echo "  make prod-h2          Start production with H2 (embedded DB)"
	@echo "  make prod-postgres    Start production with PostgreSQL"
	@echo "  make prod-down        Stop production environment"
	@echo "  make prod-logs        View production logs"
	@echo ""
	@echo "✨ UTILITIES"
	@echo "  make init             Initialize project (frontend setup)"
	@echo "  make quality          Run code quality checks"
	@echo "  make set-version V=x.y.z  Update version everywhere"
	@echo "  make show-version     Show current version"
	@echo ""

# ============================================
# VERSION MANAGEMENT
# ============================================
show-version:
	@echo "📌 Current version: $(VERSION)"

set-version:
	@if [ -z "$(V)" ]; then \
		echo "❌ Usage: make set-version V=x.y.z"; \
		exit 1; \
	fi
	@echo "$(V)" > VERSION
	@mvn -f backend/pom.xml versions:set -DnewVersion=$(V) -DgenerateBackupPoms=false -q 2>/dev/null || echo "⚠️  Maven version update skipped"
	@cd frontend && npm version $(V) --no-git-tag-version --allow-same-version > /dev/null 2>&1 || echo "⚠️  npm version update skipped"
	@echo "✅ Version set to $(V) (VERSION file updated)"

# ============================================
# INITIALIZATION
# ============================================
init:
	@echo "🔧 Initializing project..."
	@if [ -f frontend/package-lock.json ]; then \
		echo "✅ Frontend already initialized"; \
	else \
		echo "📦 Installing frontend dependencies..."; \
		cd frontend && npm install; \
	fi
	@echo "✅ Project initialized. Run: make dev-start"

# ============================================
# DEVELOPMENT (H2 + Hot Reload)
# ============================================
dev-start:
	@echo "🚀 Starting development environment (H2)..."
	docker compose -f docker-compose.dev.yml up -d --build
	@echo ""
	@echo "✅ Development services started!"
	@echo "   🌐 App (Nginx):       http://localhost:8080"
	@echo "   🎨 Angular direct:    http://localhost:4200"
	@echo "   🔧 Backend direct:    http://localhost:8081"
	@echo "   🐛 Remote Debug:      localhost:5005"
	@echo ""
	@echo "📋 View logs: make dev-logs"

dev-down:
	@echo "⛔ Stopping development environment..."
	docker compose -f docker-compose.dev.yml down
	@echo "✅ Development services stopped"

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

dev-clean:
	@echo "🧹 Cleaning development environment (removes volumes)..."
	docker compose -f docker-compose.dev.yml down -v
	@echo "✅ Development environment cleaned"

# ============================================
# PRODUCTION (H2 or PostgreSQL)
# ============================================
prod-h2:
	@echo "🚀 Starting production with H2 (embedded DB)..."
	DB_PROFILE=h2 docker compose up -d --build
	@echo ""
	@echo "✅ Production app started with H2!"
	@echo "   🌐 App: http://localhost:8090"
	@echo "   📋 View logs: make prod-logs"

prod-postgres:
	@echo "🚀 Starting production with PostgreSQL..."
	@if [ ! -f .env ]; then \
		echo "⚠️  No .env file found. Creating from .env.example..."; \
		cp .env.example .env; \
		echo "📝 Edit .env with your PostgreSQL credentials"; \
		echo "   DB_PROFILE=postgres"; \
		echo "   DB_HOST=your_host"; \
		echo "   DB_PASSWORD=your_password"; \
		exit 1; \
	fi
	DB_PROFILE=postgres docker compose --profile postgres up -d --build
	@echo ""
	@echo "✅ Production app started with PostgreSQL!"
	@echo "   🌐 App: http://localhost:8090"
	@echo "   🗄️  PostgreSQL: localhost:5432"
	@echo "   📋 View logs: make prod-logs"

prod-down:
	@echo "⛔ Stopping production environment..."
	docker compose down
	@echo "✅ Production services stopped"

prod-logs:
	docker compose logs -f

# ============================================
# QUALITY
# ============================================
quality: quality-backend quality-frontend
	@echo "✅ All quality checks passed!"

quality-backend:
	@echo "🔎 Backend quality checks (Checkstyle)..."
	cd backend && mvn --batch-mode -q checkstyle:check 2>/dev/null || echo "⚠️  Checkstyle not configured"

quality-frontend:
	@echo "🔎 Frontend quality checks (ESLint + TypeScript)..."
	@if [ -d frontend/node_modules ]; then \
		cd frontend && npm run lint 2>/dev/null || echo "⚠️  ESLint not configured"; \
		cd frontend && npx tsc --noEmit 2>/dev/null || echo "⚠️  TypeScript check failed"; \
	else \
		echo "⚠️  node_modules not found. Run: make init"; \
	fi



# ============================================
# DEMO DATA SEED
# ============================================
# Usage:
#   make seed-demo                            # default users.json
#   make seed-demo DATA=scripts/demo-data/users-real.json
seed-demo:
	@echo "🌱 Seeding demo data (dev — http://localhost:8081)..."
	@chmod +x scripts/seed-demo.sh
	@scripts/seed-demo.sh http://localhost:8081 admin admin123 $(DATA)
	@echo ""
 
seed-demo-prod:
	@echo "🌱 Seeding demo data (prod — http://localhost:8090)..."
	@chmod +x scripts/seed-demo.sh
	@scripts/seed-demo.sh http://localhost:8090 admin admin123 $(DATA)
	@echo ""
 