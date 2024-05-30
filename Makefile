.DEFAULT_GOAL := help
DOCKER_COMPOSE := docker-compose

.PHONY: help
help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  up           Start Docker containers"
	@echo "  down         Stop Docker containers and remove them"
	@echo "  clean        Remove all Docker containers"
	@echo "  logs         Shows logs for the cron jobs"
	@echo "  build        Build the Docker images"
	@echo "  run          Build the cron image and run it"

.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs --tail=4 nest-cloud-run

.PHONY: up
up: clean
	$(DOCKER_COMPOSE) up -d

.PHONY: down
down:
	$(DOCKER_COMPOSE) down

.PHONY: clean
clean:
	@echo "Stopping and removing all Docker containers..."
	$(DOCKER_COMPOSE) down --remove-orphans
	@docker ps -aq | xargs -r docker rm -f
	@echo "All Docker containers removed."

.PHONY: build
build:
	$(DOCKER_COMPOSE) build

.PHONY: run
run: clean build
	$(DOCKER_COMPOSE) up -d
