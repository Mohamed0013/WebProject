# ============================================================
#  Darija Learn — Makefile
#  Usage: make <target>
# ============================================================

COMPOSE        = docker compose
BACKEND        = $(COMPOSE) exec backend
ARTISAN        = $(BACKEND) php artisan
NPM            = $(COMPOSE) exec frontend npm

.DEFAULT_GOAL  := help

# ─────────────────────────────────────────────────────────────
#  HELP
# ─────────────────────────────────────────────────────────────
.PHONY: help
help:
	@echo ""
	@echo "  ╔══════════════════════════════════════════╗"
	@echo "  ║        Darija Learn — Make Commands      ║"
	@echo "  ╚══════════════════════════════════════════╝"
	@echo ""
	@echo "  SETUP"
	@echo "    make install       Full first-time setup"
	@echo "    make env           Copy .env.example → .env"
	@echo ""
	@echo "  DOCKER"
	@echo "    make up            Start all containers (detached)"
	@echo "    make down          Stop all containers"
	@echo "    make restart       Restart all containers"
	@echo "    make build         Build / rebuild images"
	@echo "    make logs          Follow logs (all services)"
	@echo "    make logs-back     Follow backend logs only"
	@echo "    make logs-front    Follow frontend logs only"
	@echo "    make ps            List running containers"
	@echo "    make prune         Remove stopped containers & unused images"
	@echo ""
	@echo "  BACKEND (Laravel)"
	@echo "    make shell-back    Open shell in backend container"
	@echo "    make migrate       Run database migrations"
	@echo "    make migrate-fresh Fresh migration + seeders"
	@echo "    make seed          Run seeders"
	@echo "    make key           Generate Laravel APP_KEY"
	@echo "    make cache         Clear all caches"
	@echo "    make optimize      Cache config/routes/views (production)"
	@echo "    make test-back     Run PHPUnit tests"
	@echo ""
	@echo "  FRONTEND (React)"
	@echo "    make shell-front   Open shell in frontend container"
	@echo "    make npm-install   Run npm install in frontend"
	@echo "    make test-front    Run frontend tests"
	@echo "    make build-front   Build frontend for production"
	@echo ""
	@echo "  DATABASE"
	@echo "    make db-shell      Open MySQL shell"
	@echo "    make db-dump       Dump database to ./backup.sql"
	@echo "    make db-restore    Restore from ./backup.sql"
	@echo ""


# ─────────────────────────────────────────────────────────────
#  SETUP
# ─────────────────────────────────────────────────────────────
.PHONY: install
install: env build up key migrate seed npm-install
	@echo ""
	@echo "  ✅  Setup complete!"
	@echo "  🌐  Frontend : http://localhost"
	@echo "  🔌  API      : http://localhost/api"
	@echo "  🗄️  MinIO    : http://localhost:9001"
	@echo ""

.PHONY: env
env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "  ✅  .env created from .env.example"; \
	else \
		echo "  ⚠️   .env already exists — skipping"; \
	fi


# ─────────────────────────────────────────────────────────────
#  DOCKER
# ─────────────────────────────────────────────────────────────
.PHONY: up
up:
	$(COMPOSE) up -d
	@echo "  ✅  Containers started"

.PHONY: down
down:
	$(COMPOSE) down
	@echo "  ✅  Containers stopped"

.PHONY: restart
restart: down up

.PHONY: build
build:
	$(COMPOSE) build --no-cache

.PHONY: logs
logs:
	$(COMPOSE) logs -f

.PHONY: logs-back
logs-back:
	$(COMPOSE) logs -f backend

.PHONY: logs-front
logs-front:
	$(COMPOSE) logs -f frontend

.PHONY: ps
ps:
	$(COMPOSE) ps

.PHONY: prune
prune:
	docker system prune -f
	@echo "  ✅  Docker cleanup done"


# ─────────────────────────────────────────────────────────────
#  BACKEND — Laravel
# ─────────────────────────────────────────────────────────────
.PHONY: shell-back
shell-back:
	$(BACKEND) sh

.PHONY: migrate
migrate:
	$(ARTISAN) migrate --force

.PHONY: migrate-fresh
migrate-fresh:
	$(ARTISAN) migrate:fresh --seed --force

.PHONY: seed
seed:
	$(ARTISAN) db:seed --force

.PHONY: key
key:
	$(ARTISAN) key:generate

.PHONY: cache
cache:
	$(ARTISAN) cache:clear
	$(ARTISAN) config:clear
	$(ARTISAN) route:clear
	$(ARTISAN) view:clear
	@echo "  ✅  All caches cleared"

.PHONY: optimize
optimize:
	$(ARTISAN) config:cache
	$(ARTISAN) route:cache
	$(ARTISAN) view:cache
	@echo "  ✅  Application optimized for production"

.PHONY: test-back
test-back:
	$(BACKEND) php artisan test


# ─────────────────────────────────────────────────────────────
#  FRONTEND — React
# ─────────────────────────────────────────────────────────────
.PHONY: shell-front
shell-front:
	$(COMPOSE) exec frontend sh

.PHONY: npm-install
npm-install:
	$(NPM) install

.PHONY: test-front
test-front:
	$(NPM) test

.PHONY: build-front
build-front:
	$(NPM) run build
	@echo "  ✅  Frontend built for production"


# ─────────────────────────────────────────────────────────────
#  DATABASE
# ─────────────────────────────────────────────────────────────
.PHONY: db-shell
db-shell:
	$(COMPOSE) exec mysql mysql -u$${DB_USERNAME} -p$${DB_PASSWORD} $${DB_DATABASE}

.PHONY: db-dump
db-dump:
	$(COMPOSE) exec mysql mysqldump -u$${DB_USERNAME} -p$${DB_PASSWORD} $${DB_DATABASE} > backup.sql
	@echo "  ✅  Database dumped to backup.sql"

.PHONY: db-restore
db-restore:
	$(COMPOSE) exec -T mysql mysql -u$${DB_USERNAME} -p$${DB_PASSWORD} $${DB_DATABASE} < backup.sql
	@echo "  ✅  Database restored from backup.sql"