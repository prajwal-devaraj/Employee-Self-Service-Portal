.PHONY: up down logs test lint seed

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

test:
	docker compose run --rm api pytest -q
	docker compose run --rm web npm test -- --run

lint:
	docker compose run --rm api ruff check app tests
	docker compose run --rm api mypy app
	docker compose run --rm web npm run lint
	docker compose run --rm web npm run typecheck

seed:
	docker compose exec api python -m app.seed
