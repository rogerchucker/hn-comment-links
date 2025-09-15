module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'tests/chrome-mock.js',
      { pattern: '*.js', included: false, served: true },
      { pattern: 'tests/**/*.tests.ts', watched: false },
      { pattern: 'popup.html', included: false, served: true },
    ],
    preprocessors: {
      '*.js': ['rollup'],
      '**/*.ts': ['rollup'],
      '**/*.html': ['html2js']
    },
    rollupPreprocessor: {
      plugins: [
        require('@rollup/plugin-typescript')({
          tsconfig: 'tsconfig.json'
        }),
        require('rollup-plugin-istanbul')({
          exclude: ['tests/**/*.ts', 'node_modules/**']
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
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },
    browsers: ['ChromeHeadless'],
    singleRun: true
  });
};