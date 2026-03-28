const esbuild = require('esbuild');
const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/js/main.js'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  splitting: true,
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
  target: ['es2020'],
  external: ['three'],
  loader: {
    '.css': 'css',
  },
};

if (isWatch) {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(config).then(() => {
    console.log('Build complete.');
  });
}
