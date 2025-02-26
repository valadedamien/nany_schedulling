#!/bin/bash
set -e

# Créer la structure de dossiers pour Docker
echo "Création des répertoires Docker..."
mkdir -p .docker/php .docker/nginx/conf.d .docker/db

# Créer un répertoire temporaire en dehors de Docker
echo "Création d'un répertoire temporaire pour Symfony..."
TEMP_DIR=$(mktemp -d)
echo "Répertoire temporaire créé: $TEMP_DIR"

# Utiliser Composer en local pour initialiser le projet dans le répertoire temporaire
echo "Initialisation du projet Symfony dans le répertoire temporaire..."
composer create-project symfony/skeleton:"7.2.*" $TEMP_DIR --no-interaction

# Déplacer les fichiers du projet temporaire vers le répertoire courant
echo "Déplacement des fichiers vers le répertoire du projet..."
cp -r $TEMP_DIR/. .

# Nettoyage du répertoire temporaire
echo "Nettoyage du répertoire temporaire..."
rm -rf $TEMP_DIR

# Démarrer les conteneurs Docker
echo "Démarrage des conteneurs Docker..."
docker-compose up -d

# Attendre que les conteneurs soient prêts
echo "Attente de 10 secondes pour s'assurer que les conteneurs sont prêts..."
sleep 10

# Installation des dépendances Symfony
echo "Installation des dépendances Symfony..."
docker-compose exec php composer require \
    symfony/webapp-pack \
    symfony/webpack-encore-bundle \
    doctrine/doctrine-bundle \
    doctrine/doctrine-migrations-bundle \
    doctrine/orm \
    symfony/maker-bundle \
    api-platform/core \
    doctrine/doctrine-fixtures-bundle \
    --no-interaction

# Création des répertoires pour Vue.js
echo "Création des répertoires pour Vue.js..."
mkdir -p assets/vue/{components,composables,models,services,views}
mkdir -p assets/styles

# Création des fichiers de configuration Vue.js
echo "Création des fichiers de configuration..."

# package.json
cat > package.json << 'EOL'
{
  "name": "nanny-scheduling",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev-server": "encore dev-server",
    "dev": "encore dev",
    "watch": "encore dev --watch",
    "build": "encore production --progress"
  },
  "dependencies": {
    "@vueuse/core": "^10.7.0",
    "core-js": "^3.34.0",
    "vue": "^3.3.4",
    "vue-router": "^4.2.5"
  },
  "devDependencies": {
    "@babel/core": "^7.17.0",
    "@babel/preset-env": "^7.16.0",
    "@hotwired/stimulus": "^3.0.0",
    "@symfony/stimulus-bridge": "^3.2.0",
    "@symfony/webpack-encore": "^4.0.0",
    "@vue/compiler-sfc": "^3.3.4",
    "autoprefixer": "^10.4.16",
    "file-loader": "^6.0.0",
    "postcss": "^8.4.31",
    "postcss-loader": "^7.3.3",
    "sass": "^1.69.5",
    "sass-loader": "^13.3.2",
    "tailwindcss": "^3.3.5",
    "ts-loader": "^9.5.1",
    "typescript": "^5.3.2",
    "vue-loader": "^17.3.1",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-notifier": "^1.15.0"
  }
}
EOL

# webpack.config.js
cat > webpack.config.js << 'EOL'
const Encore = require("@symfony/webpack-encore");

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || "dev");
}

Encore
    .setOutputPath("public/build/")
    .setPublicPath("/build")
    .addEntry("app", "./assets/app.js")
    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = "usage";
        config.corejs = "3.23";
    })
    .enableVueLoader(() => {}, { runtimeCompilerBuild: false })
    .enableTypeScriptLoader()
    .enablePostCssLoader()
;

module.exports = Encore.getWebpackConfig();
EOL

# tailwind.config.js
cat > tailwind.config.js << 'EOL'
/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./assets/**/*.{vue,js,ts,jsx,tsx}",
    "./templates/**/*.{html,twig}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

# postcss.config.js
cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
EOL

# tsconfig.json
cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "es2017",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ESNext", "DOM"],
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "importHelpers": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./assets/*"]
    },
    "jsx": "preserve"
  },
  "include": [
    "./assets/**/*.ts",
    "./assets/**/*.tsx",
    "./assets/**/*.vue"
  ],
  "exclude": [
    "node_modules"
  ]
}
EOL

# app.js
cat > assets/app.js << 'EOL'
import "./styles/app.css";
import { createApp } from "vue";
import App from "./vue/App.vue";

const app = createApp(App);
app.mount("#app");
EOL

# app.css
cat > assets/styles/app.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Style personnalisés */
.btn {
  @apply px-4 py-2 rounded font-semibold;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.btn-secondary {
  @apply bg-gray-300 text-gray-800 hover:bg-gray-400;
}
EOL

# App.vue
mkdir -p assets/vue
cat > assets/vue/App.vue << 'EOL'
<template>
  <div class="container mx-auto p-4">
    <header class="mb-8">
      <h1 class="text-3xl font-bold">Planning Nounou</h1>
    </header>

    <main>
      <p class="mb-4">Votre application de planification est en cours de développement.</p>
      <button class="btn btn-primary">Commencer</button>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "App"
})
</script>
EOL

# AppController.php
mkdir -p src/Controller
cat > src/Controller/AppController.php << 'EOL'
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AppController extends AbstractController
{
    #[Route("/", name: "app_home")]
    public function index(): Response
    {
        return $this->render("app/index.html.twig");
    }
}
EOL

# Template Twig
mkdir -p templates/app
cat > templates/app/index.html.twig << 'EOL'
{% extends "base.html.twig" %}

{% block title %}Planning Nounou{% endblock %}

{% block body %}
    <div id="app"></div>
{% endblock %}
EOL

# Installation des dépendances front-end
echo "Installation des dépendances front-end..."
docker-compose exec node yarn install

# Création de la base de données
echo "Création de la base de données..."
docker-compose exec php bin/console doctrine:database:create --if-not-exists

# Construction des assets
echo "Construction des assets..."
docker-compose exec node yarn encore dev

# Fin
echo ""
echo "✅ Projet initialisé avec succès!"
echo "Accédez à votre application à l'adresse: http://localhost:8080"
echo ""
