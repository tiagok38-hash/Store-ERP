import { Hono } from "hono";
import { cors } from "hono/cors";
import { productsWithStockApi } from './api/products-with-stock';

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors());

// API routes
app.route('/api/products-with-stock', productsWithStockApi);

// Static file serving - handle both development and production environments
const isDevelopment = typeof __STATIC_CONTENT_MANIFEST === 'undefined';

if (isDevelopment) {
  // Development environment - use simple response for static files
  app.get("/", (c) => {
    return c.html(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SmartSell Pro</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/react-app/main.tsx"></script>
  </body>
</html>`);
  });
  
  app.get("/static/*", (c) => {
    return c.text("Static file serving in development", 404);
  });
  
  app.get("/*", (c) => {
    return c.html(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SmartSell Pro</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/react-app/main.tsx"></script>
  </body>
</html>`);
  });
} else {
  // Production environment - use Cloudflare Workers static serving
  const { serveStatic } = await import("hono/cloudflare-workers");
  
  app.get("/", serveStatic({ path: "./index.html" }));
  app.get("/static/*", serveStatic({ root: "./" }));
  app.get("/*", serveStatic({ path: "./index.html" }));
}

export default app;
