const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['js/main.js'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2019'],
  charset: 'utf8',
  outfile: 'js/app.bundle.js',
  banner: {
    js: '/* Generated from js/main.js. Run `npm run build` after editing source modules. */',
  },
  logLevel: 'info',
}).catch(() => process.exit(1));
