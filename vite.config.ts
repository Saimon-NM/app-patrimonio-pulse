import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Permite que el build funcione correctamente en GitHub Pages con ruta
// del tipo `https://<user>.github.io/<repo>/`.
// Por defecto usamos `/` para dev y despliegues en el root.
const baseUrl = process.env.VITE_BASE_URL ?? '/';

export default defineConfig({
  base: baseUrl,
  resolve: {
    alias: [
      // Alias consistente con imports tipo '@/shared/...' y '@/features/...'
      { find: '@/', replacement: `${resolve(__dirname, './src')}/` },
    ],
  },
  build: {
    // Aumentamos el límite de advertencia para silenciar la notificación si no es un problema serio.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Configuramos la división dinámica de chunks (code-splitting)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Empaquetamos Recharts y D3 (que son pesados) en un archivo separado
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
              return 'charts-vendor';
            }
            // Empaquetamos el core de React en otro chunk
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // Todo lo demás va al chunk genérico de dependencias
            return 'vendor';
          }
        },
      },
    },
  },
});
