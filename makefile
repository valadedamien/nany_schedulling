# Setup ———————————————————————————————————————————————————————————————————————
GIT				= git
DOCKER			= docker compose

EXEC_PHP		= $(DOCKER) exec php
SYMFONY			= $(EXEC_PHP) bin/console
COMPOSER		= $(EXEC_PHP) composer
YARN			= $(DOCKER) exec php yarn

SENTRY			= sentry-cli
SENTRY_ORG		= odandb
SENTRY_PROJECT	= skiif

OS := $(shell uname)

.DEFAULT_GOAL = help

## —— Makefile 🍺 ——————————————————————————————————————————————————————————————
help:
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' \
		| sed -e 's/\[32m##/[33m/'

install: build start dev db-reset jwt-generate-keys stop ## Installe le projet

.PHONY: help install

## —— Copy 📋 ——————————————————————————————————————————————————————————————————
jwt-generate-keys: ## Initialisation de JWT
	$(SYMFONY) lexik:jwt:generate-keypair --overwrite --no-interaction

.PHONY: jwt-generate-keys

## —— Docker 🐳 ————————————————————————————————————————————————————————————————
build: docker-compose.yml ## Build les images du projet
	$(DOCKER) pull --parallel --quiet --ignore-pull-failures 2> /dev/null
	$(DOCKER) -f docker-compose.yml build --pull --no-cache

start: ## Démarre le projet
	rm -rf .docker/data/db/mysql.sock
	docker network create internal || true
	$(DOCKER) -f docker-compose.yml up -d --remove-orphans --no-recreate

stop: ## Stop le projet
	$(DOCKER) down --volumes --remove-orphans

bash: ## Entrer dans le container php
	$(DOCKER) exec php sh

supervisor-start: ## Lancer supervisord une fois le container php démarré
	$(EXEC_PHP) sh -c "/usr/bin/supervisord -c /etc/supervisord.conf"

supervisor-stop: ## Stopper supervisord
	$(EXEC_PHP) sh -c '/srv/app/bin/stop-supervisord.sh'

.PHONY: build start stop bash

## —— Symfony 🎵 ———————————————————————————————————————————————————————————————
cc: ## Vide le cache
	$(SYMFONY) c:c --no-warmup || rm -rf var/cache/*

warmup: cc ## Warmup the cache
	$(SYMFONY) cache:warmup

consume: # Consomme les messages de messenger
	$(SYMFONY) messenger:consume async -vv

countries: # Build le fichier des pays à destination de l'API
	$(SYMFONY) app:build-country-file

.PHONY: cc warmup consume countries

## —— MySQL 💾 —————————————————————————————————————————————————————————————————
db-cache: vendor ## Vide le cache de doctrine
	$(SYMFONY) doctrine:cache:clear-metadata
	$(SYMFONY) doctrine:cache:clear-query
	$(SYMFONY) doctrine:cache:clear-result

db-clear: vendor ## Vide la base de donnée si des migrations ne sont plus compatibles avec l'existant
	$(SYMFONY) doctrine:database:drop --if-exists --force
	$(SYMFONY) doctrine:database:create --if-not-exists

db-reset: db-clear ## Reset de la base de donnée
	$(SYMFONY) doctrine:migrations:migrate --no-interaction --allow-no-migration
	$(SYMFONY) doctrine:fixtures:load --no-interaction --append --group=DevFixtures

db-update: vendor ## Met à jour le schema de la base de donnée
	$(SYMFONY) doctrine:schema:update --force

db-validate: vendor ## Vérifie le schéma de base de données
	$(SYMFONY) d:s:v

.PHONY: db-cache db-reset db-update db-validate

## —— Composer 🧙 ——————————————————————————————————————————————————————————————
composer.lock: composer.json ## Met à jour les vendors selon le fichier composer.json
	$(COMPOSER) update

vendor: composer.lock ## Installe les vendors en fonction du fichier composer.lock actuel
	$(COMPOSER) install --no-progress --prefer-dist --optimize-autoloader

## —— Yarn 🐱 / JavaScript —————————————————————————————————————————————————————
yarn.lock: package.json ## Met à jour les node_modules selon le fichier package.json
	$(YARN) upgrade

yarn_install: yarn.lock ## Installe les node_modules en fonction du fichier yarn.lock
	$(YARN) install

dev: yarn_install ## Build les assets en mode dev
	$(YARN) run dev

prod: yarn_install ## Build les assets en mode prod (compresser)
	$(YARN) run build

watch: yarn_install ## Watch les fichiers et build les assets quand c'est nécessaire en mode dev
	$(YARN) run watch

.PHONY: dev prod watch

## —— Coding standards ✨  —————————————————————————————————————————————————————
lint: lcontainer ldeprecations lyaml cs-fix phpstan ## Lance tout les linters

lcontainer: ## Garantit que les arguments injectés dans les services correspondent aux déclarations de type
	$(SYMFONY) lint:container

ldeprecations: ## Vérifie les déprécations
	$(SYMFONY) debug:container --deprecations

lyaml: ## Lint les fichiers YAML
	$(SYMFONY) lint:yaml config --parse-tags

cs-fix: ## Lint les fichiers PHP
	$(EXEC_PHP) php-cs-fixer self-update || true
	$(EXEC_PHP) php-cs-fixer fix --config=.php-cs-fixer.php --verbose --using-cache=no

phpstan: ## Execute PHPStan
	$(SYMFONY) c:c --env test
	$(EXEC_PHP) vendor/bin/phpstan analyse --memory-limit 1G -c phpstan.neon

rector: ## Execute Rector
	$(EXEC_PHP) vendor/bin/rector process src --clear-cache

coverage: ## Lance tout les tests avec coverage
	$(EXEC_PHP) php -d memory_limit=1G bin/phpunit --stop-on-failure --coverage-clover tests/coverage.xml

.PHONY: lint lcontainer ldeprecations lyaml cs-fix phpstan coverage

## —— Tests ✅  ————————————————————————————————————————————————————————————————
reset-test: ## Réinitialise tout les éléments concernant les tests
	$(SYMFONY) c:c --no-warmup --env test || rm -rf var/cache/test/*
	$(SYMFONY) doctrine:database:drop --if-exists --force --env test
	$(SYMFONY) doctrine:database:create --if-not-exists  --env test
	$(SYMFONY) doctrine:migrations:migrate --no-interaction --allow-no-migration --env test

test: ## Lance tout les tests
	$(EXEC_PHP) php -d memory_limit=2G bin/phpunit --stop-on-failure

testu: ## Lance les tests unitaire
	$(EXEC_PHP) php bin/phpunit tests/Unit --stop-on-failure --bootstrap vendor/autoload.php

testf: ## Lance les tests fonctionnel
	$(EXEC_PHP) php bin/phpunit tests/Functional --stop-on-failure

testc: ## Lance les tests coverage html
	$(EXEC_PHP) php -d memory_limit=1G bin/phpunit --stop-on-failure --coverage-html coverage/html

.PHONY: reset-test test testu testf

## —— Git 🔃  —————————————————————————————————————————————————————————————
pull: ## Pull la branche dev et fait les migrations et charge les dernieres pages
	$(GIT) checkout dev
	$(GIT) pull
	$(COMPOSER) install --no-progress --prefer-dist --optimize-autoloader
	$(SYMFONY) doctrine:migrations:migrate --no-interaction --allow-no-migration
	$(YARN) install
	$(YARN) run dev

#check-pr: vendor db-validate cs-fix phpstan test ## À exécuter avant de créer une PR
check-pr: vendor cs-fix phpstan test ## À exécuter avant de créer une PR

rebase:
	$(GIT) pull
	$(GIT) fetch origin
	$(GIT) rebase origin/dev

rebase-cancel:
	$(GIT) rebase --abort

rebase-continue:
	$(GIT) rebase --continue || true

rebase-end:
	$(GIT) push origin $($(GIT) branch --show-current) -f

.PHONY: pull check-pr rebase rebase-cancel rebase-continue rebase-end

## —— Release 📜 ———————————————————————————————————————————————————————————————
release: ## Créer une release du projet
	$(GIT) tag -a $(APP_VERSION)
	$(GIT) push --tags
	$(SENTRY) releases -o $(SENTRY_ORG) new -p $(SENTRY_PROJECT) "$(APP_VERSION)"
	$(SENTRY) releases -o $(SENTRY_ORG) -p $(SENTRY_PROJECT) set-commits "$(APP_VERSION)" --auto --ignore-missing
	$(SENTRY) releases -o $(SENTRY_ORG) -p $(SENTRY_PROJECT) finalize "$(APP_VERSION)"

deploy-init: ## Dependance pour le déploiement manuel vers aws
	npm install -g beanstalk-deploy

zip-aws: ## Crée le livrable pour AWS à uploader dans la console d'AWS Elastic Beanstalk
	bin/aws-create-archive.sh platform=dev

zip-aws-cp:
	bin/aws-create-archive.sh platform=dev method=copy

deploy-aws: ## Déploie le projet sur AWS
	bin/aws-deploy.sh platform=dev ./skiif-aws/deploy.zip

.PHONY: release
