import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'fs';

// Check if we're building the content script
const isContentBuild = process.env.BUILD_TARGET === 'content';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    react(),
    {
      name: 'fix-extension-paths',
      closeBundle() {
        if (isContentBuild) return; // Skip for content build

        const distDir = resolve(__dirname, 'dist');

        // Copy and fix popup HTML paths
        const srcHtml = resolve(distDir, 'src/popup/index.html');
        const destDir = resolve(distDir, 'popup');
        const destHtml = resolve(destDir, 'index.html');

        if (existsSync(srcHtml)) {
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }

          let html = readFileSync(srcHtml, 'utf-8');
          html = html.replace(/src="[^"]*\/popup\.js"/g, 'src="./popup.js"');
          html = html.replace(/href="[^"]*\/chunks\//g, 'href="../chunks/');
          html = html.replace(/src="[^"]*\/chunks\//g, 'src="../chunks/');
          html = html.replace(/href="[^"]*popup\.css"/g, 'href="./styles/popup.css"');
          writeFileSync(destHtml, html);
        }

        // Copy content CSS to correct location
        const contentStylesDir = resolve(distDir, 'content/styles');
        if (!existsSync(contentStylesDir)) {
          mkdirSync(contentStylesDir, { recursive: true });
        }

        const srcContentCss = resolve(__dirname, 'src/content/styles/content.css');
        const destContentCss = resolve(contentStylesDir, 'content.css');
        if (existsSync(srcContentCss)) {
          copyFileSync(srcContentCss, destContentCss);
        }

        // Clean up leftover src folder
        const srcFolder = resolve(distDir, 'src');
        if (existsSync(srcFolder)) {
          rmSync(srcFolder, { recursive: true });
        }
      }
    }
  ],
  base: '',
  build: isContentBuild
    ? {
        // Content script build - IIFE format, no code splitting
        outDir: 'dist',
        emptyOutDir: false, // Don't clear dist, we're adding to it
        lib: {
          entry: resolve(__dirname, 'src/content/index.tsx'),
          name: 'PinpointContent',
          formats: ['iife'],
          fileName: () => 'content/index.js',
        },
        rollupOptions: {
          output: {
            extend: true,
          },
        },
      }
    : {
        // Main build - popup and background
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            popup: resolve(__dirname, 'src/popup/index.html'),
            background: resolve(__dirname, 'src/background/service-worker.ts'),
          },
          output: {
            entryFileNames: (chunkInfo) => {
              if (chunkInfo.name === 'background') return 'background/service-worker.js';
              return 'popup/[name].js';
            },
            chunkFileNames: 'chunks/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                return 'popup/styles/popup.css';
              }
              return 'assets/[name]-[hash][extname]';
            },
          },
        },
      },
  publicDir: isContentBuild ? false : 'public',
});
