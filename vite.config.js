// vite.config.ts
import { defineConfig } from "vite";


import path from "path";


export default defineConfig({
  plugins: [],
  resolve: {
    alias: [
    
    ],
  },
  server: {
    port: 3000,
  },
  build: {
    manifest: true,
    minify: true,
    reportCompressedSize: true,
    copyPublicDir:false,
    lib: {
      entry: path.resolve(__dirname, "src/BlendTree.js"),
      fileName: "BlendTree",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [],
      plugins: [
        
      ],
    },
  },
});