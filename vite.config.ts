import { defineConfig } from 'vite';
import unocssPlugin from 'unocss/vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [unocssPlugin(), solidPlugin()],
});
