import { defineConfig, loadEnv } from 'vite';

// Dev-only shim: serves /api/* using the same serverless handlers Vercel runs in production.
function apiDevServer(env) {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      Object.assign(process.env, env);
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();
        const name = req.url.slice(5).split('?')[0].replace(/[^a-z-]/gi, '');
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`);
          let raw = '';
          for await (const c of req) raw += c;
          try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
          res.status = (c) => { res.statusCode = c; return res; };
          res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
          await mod.default(req, res);
        } catch (e) {
          console.error(e);
          res.statusCode = 500; res.end(JSON.stringify({ error: 'Server error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [apiDevServer(loadEnv(mode, process.cwd(), ''))],
  build: { chunkSizeWarningLimit: 1200 },
}));
