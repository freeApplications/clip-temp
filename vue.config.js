// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  pages: {
    index: 'src/pages/main.ts',
    'first-in-first-out': 'src/pages/first-in-first-out.ts',
  },
  pluginOptions: {
    electronBuilder: {
      externals: ['clipboard-event'],
      preload: 'src/preload.ts',
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        '~': path.join(__dirname, 'src'),
      },
    },
  },
};
