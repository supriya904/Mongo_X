import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { promises as fs } from 'fs';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'handle-user-data',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/saveUser' && req.method === 'POST') {
            try {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });

              req.on('end', async () => {
                const userData = JSON.parse(body);
                const filePath = resolve(__dirname, 'src/data/users.json');
                await fs.writeFile(filePath, JSON.stringify(userData, null, 2));
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              });
            } catch (error) {
              console.error('Error saving user data:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to save user data' }));
            }
          } else {
            next();
          }
        });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
