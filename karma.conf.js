
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'tests/chrome-mock.js',
      { pattern: 'tests/**/*.tests.ts', watched: false },
      { pattern: 'popup.html', included: false, served: true },
    ],
    preprocessors: {
      '**/*.ts': ['rollup'],
      '**/*.html': ['html2js']
    },
    rollupPreprocessor: {
      plugins: [
        require('@rollup/plugin-typescript')({
          tsconfig: 'tsconfig.json'
        })
      ],
      output: {
        format: 'iife',
        name: 'test',
        sourcemap: 'inline',
        globals: {
          tslib: 'tslib'
        }
      }
    },
    reporters: ['spec'],
    browsers: ['ChromeHeadless'],
    singleRun: true
  });
};
