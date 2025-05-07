#!/usr/bin/env node

import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

esbuild.build({
  entryPoints: [path.join(__dirname, 'src/index.js')],
  bundle: true,
  outfile: path.join(__dirname, 'dist/parade.js'),
  platform: 'node',
  target: 'node14',
  format: 'esm',
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: [
    // Node.js built-ins
    'path', 'fs', 'events', 'os', 'util', 'stream', 'buffer', 'url', 'process',
    // Dependencies
    'react', 'ink', 'ink-spinner', 'dotenv', 'commander', 
    '@ai-sdk/openai', '@ai-sdk/anthropic', '@ai-sdk/google'
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  jsx: 'automatic',
  jsxImportSource: 'react',
  loader: {
    '.js': 'jsx'
  }
}).catch((err) => {
  console.error(err);
  process.exit(1);
});