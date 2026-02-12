# ===== PRODUCTION =====

run:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

restart: down run

ps:
	docker compose ps

clean:
	docker compose down --volumes --remove-orphans



# ===== DEVELOPMENT (быстрое локальное окружение) =====

dev:
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down --remove-orphans

dev-clean:
	docker compose -f docker-compose.dev.yml down --volumes --remove-orphans

dev-restart: dev-down dev
