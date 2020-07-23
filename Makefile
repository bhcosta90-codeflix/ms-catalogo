PHONY: *

help:
	@printf "\033[33mComo usar:\033[0m\n  make [comando] [arg=\"valor\"...]\n\n\033[33mComandos:\033[0m\n"
	@grep -E '^[-a-zA-Z0-9_\.\/]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[32m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Instala as configurações do elasticsearch
	cp .env.example .env || true
	sudo mkdir .data/elasticdata -p
	sudo chmod 777 -R .data/elasticdata

up: ## Inicia o Rabbitmq e o projeto
	docker-compose -f ./../rabbitmq/docker-compose.yaml up -d --force-recreate
	docker-compose -f docker-compose.yaml up -d --force-recreate

bash: ## Inicia o bash
	docker-compose -f docker-compose.yaml exec ms_catalog_app bash
