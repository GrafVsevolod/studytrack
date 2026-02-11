run:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

restart: down run

ps:
	docker compose ps

clean:
	docker compose down --volumes --remove-orphans
