import terser from '@rollup/plugin-terser';
import shebang from 'rollup-plugin-shebang-bin';
import typescript from '@rollup/plugin-typescript';
import autoExternal from 'rollup-plugin-auto-external';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const plugins = [
  autoExternal({
    builtins: true
  }),
  typescript(),
  nodeResolve(),
  shebang({
    include: ['**/*.ts']
  })
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(terser());
}

export default {
  input: './src/index.ts',
  output: {
    dir: './lib',
    format: 'esm'
  },
  plugins
};
