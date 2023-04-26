## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Flag in use is `nextjs-example`. https://app.unleash-hosted.com/demo/projects/default/features/nextjs-example

## Available examples

- `./src/pages/csr.tsx` - Client-side rendering - simple use case, with loader
- `./src/pages/ssr.tsx` - Server-side rendering - when you need to keep some data private
- `./src/pages/ssg.tsx` - Static site generation - performance optimization

### API

- `./src/pages/api/hello.ts` - API route responding with JSON

### Middleware

Example of A/B testing with Next.js Middleware.
Redirect users to different (pre-rendered) page based on a feature flag.

- `./src/pages/api/proxy-definitions.ts`
- `./src/middleware.ts`
- `./src/pages/ab/a` & `./src/pages/ab/b`
