import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/dashboard-v2-main-/',
    plugins: [react()],
    server: {
      proxy: {
        '/api/openai': {
          target: env.VITE_AZURE_OPENAI_ENDPOINT,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openai/, `/openai/deployments/${env.VITE_AZURE_OPENAI_DEPLOYMENT}/chat/completions`),
          headers: {
            'api-key': env.VITE_AZURE_OPENAI_KEY,
          },
        },
      },
    },
  }
})
