## Next.js with Unleash

To run this code locally:

```bash
git clone https://github.com/Unleash/unleash-client-nextjs.git
cd unleash-client-nextjs/example
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Flag in use is `nextjs-example`. https://app.unleash-hosted.com/demo/projects/default/features/nextjs-example

## Available examples

### App Router

- `./src/app/app-page/page.tsx` - Server-side component page, with loader
- `./src/app/api-route/route.tsx` - JSON API response

### Pages Router

- `./src/pages/csr.tsx` - Client-side rendering - simple use case, with loader
- `./src/pages/ssr.tsx` - Server-side rendering - when you need to keep some data private
- `./src/pages/ssg.tsx` - Static site generation - performance optimization

### API

- `./src/pages/api/hello.ts` - API route responding with JSON

### Middleware

Example of A/B testing with Next.js Middleware.
Redirect users to a different (pre-rendered) page based on a feature flag.

- `./src/pages/api/proxy-definitions.ts` - act as cache for feature flag definitions. This lets this SDK act as a substitute for Unleash Edge or the Unleash proxy that you can deploy on Next.js Edge.
- `./src/middleware.ts`- handle flag evaluation and transparently redirect to one of the pages in `./src/pages/ab` directory
- `./src/pages/ab/a` & `./src/pages/ab/b` - target pages. Both will be served at the URL `/ab`, but which one you see is decided by the feature flag in `./src/middleware.ts`.
