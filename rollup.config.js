import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import externals from 'rollup-plugin-node-externals';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: pkg.source,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
      { file: 'src/TYNativeApi.js', format: 'es' },
    ],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      terser(),
      commonjs(),
      externals({ deps: true }),
    ],
  },
];
