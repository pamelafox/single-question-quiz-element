import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';

export default {
  input: 'src/quiz-element.js',
  output: {
    name: 'QuizElement',
    file: pkg.browser,
    format: 'umd',
  },
  plugins: [
    resolve(),
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
  ],
};
