import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    viteSingleFile()
  ],
  build: {
    cssCodeSplit: false, // force CSS into JS
    assetsInlineLimit: 100000000, // huge limit so assets become base64 inline
  }
})
