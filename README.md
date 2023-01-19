> ## 🏗️ Early version
>
> We need your feedback. Share your comments in [🗣️ GitHub Discussions](https://github.com/Unleash/unleash/discussions) or on Unleash community [💬 Slack](https://unleash-community.slack.com/) server.

<br/>

# Unleash Next.js SDK

This package allows easy integration of [Unleash](https://github.com/unleash/unleash) feature flags in a [Next.js](https://nextjs.org/) application.

## Setup

### Installation

To install, simply run:

```
npm install @unleash/nextjs
# or
yarn add @unleash/nextjs
# or
pnpm add @unleash/nextjs
```

### Environment variables

This package tries to load configuration from
[Next.js Environment variables](https://nextjs.org/docs/basic-features/environment-variables).

If you plan to use configuration in the browser, add `NEXT_PUBLIC_` prefix.

| Prefixable     | Variable                     | Default                     | Used in                                              |
| -------------- | ---------------------------- | --------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_` | `UNLEASH_BASE_URL`           | `http://localhost:4242/api` | `FlagProvider`, `getFrontendFlags`                   |
| **No**         | `UNLEASH_API_TOKEN`          |                             | `getDefinitions`                                     |
| `NEXT_PUBLIC_` | `UNLEASH_FRONTEND_API_TOKEN` | `-`                         | `FlagProvider`, `getFrontendFlags`                   |
| `NEXT_PUBLIC_` | `UNLEASH_APP_NAME`           | `nextjs`                    | `FlagProvider`, `getFrontendFlags`, `getDefinitions` |

If both are defined and available, private variable takes priority.
You can use both to have different values on client-side and server-side.

# Usage

### A). Client-side only - simple use case and for development purposes (CSR)

Fastest way to get started is to connect frontend directly to Unleash.
You can find out more about direct [Front-end API access](https://docs.getunleash.io/reference/front-end-api) in our documentation,
including a guide on how to [setup a client-side SDK key](https://docs.getunleash.io/how-to/how-to-create-api-tokens).

```tsx
import type { AppProps } from "next/app";
import { FlagProvider } from "@unleash/nextjs";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FlagProvider
      // config prop is optional if environment variables are set
      config={{
        url: "http://localhost:4242/api", // this will override NEXT_PUBLIC_UNLEASH_BASE_URL
        clientKey: "<Frontend_API_token>", // NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN
        appName: "nextjs", // NEXT_PUBLIC_UNLEASH_APP_NAME
        refreshInterval: 15, // additional client configuration
      }}
    >
      <Component {...pageProps} />
    </FlagProvider>
  );
}
```

With `<FlagProvider />` in place you can now use hooks like: `useFlag`, `useVariant`, or `useFlagsStatus` to block rendering until flags are ready.

```jsx
import { useFlag } from "@unleash/nextjs";

const YourComponent = () => {
  const isEnabled = useFlag("nextjs-poc");

  return <>{isEnabled ? "ENABLED" : "DISABLED"}</>;
};
```

If you only plan to use [Unleash client-side React SDK](https://github.com/Unleash/proxy-client-react) now also works with Next.js. Check documentation there for more examples.

<br />

## B). Static pages (SSG)

With same access as in the client-side example above you can resolve Unleash feature flags when building static pages.

Use `getFrontendFlags` to load

```tsx
import { clientFlags, getFrontendFlags, type IVariant } from "@unleash/nextjs";
import type { GetStaticProps, NextPage } from "next";

type Props = {
  isEnabled: boolean;
  variant: IVariant;
};

const ExampleStaticPage: NextPage<Props> = ({ isEnabled, variant }) => (
  <>
    Flag status: {isEnabled ? "ENABLED" : "DISABLED"}
    <br />
    Variant: {variant.name}
  </>
);

export const getStaticProps: GetStaticProps<Props> = async (_ctx) => {
  /* Using server-side SDK: */
  const definitions = await getDefinitions();
  const { toggles } = evaluateFlags(definitions);

  /* Or with Proxy/Frontend API */
  // const { toggles } = await getFrontendFlags();

  const flags = clientFlags(toggles);

  return {
    props: {
      isEnabled: flags.isEnabled("nextjs-poc"),
      variant: flags.getVariant("nextjs-poc"),
    },
  };
};

export default ExampleStaticPage;
```

The same approach will work for [ISR (Incremental Static Regeneration)](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration).

<br />

<!-- FIXME: ## C). Server Side Rendering, bootstrapping and rehydration (SSR) -->

# Experimental features support

Unleash Next.js SDK can run on [Edge Runtime](https://nextjs.org/docs/api-reference/edge-runtime) and in [Middleware](https://nextjs.org/docs/advanced-features/middleware). We are also interested in providing an example with [App Directory](https://beta.nextjs.org/docs/app-directory-roadmap).
