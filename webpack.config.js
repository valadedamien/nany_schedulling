const Encore = require('@symfony/webpack-encore');

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .addEntry('app', './assets/app.js')
    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = 3;
    })

    // Activer la prise en charge de Vue.js
    .enableVueLoader(() => {}, {
        version: 3,
        runtimeCompilerBuild: false
    })

    // Activer TypeScript (optionnel, vous pouvez commenter ces lignes pour désactiver TypeScript temporairement)
    .enableTypeScriptLoader((config) => {
        config.transpileOnly = true
    })

    // Activer PostCSS/Tailwind
    .enablePostCssLoader()
;

module.exports = Encore.getWebpackConfig();
