> ## 🏗️ Early version
>
> We need your feedback. Share your comments in [🗣️ GitHub Discussions](https://github.com/Unleash/unleash/discussions) or on Unleash community [💬 Slack](https://unleash-community.slack.com/) server.

# Unleash Next.js SDK

This package allows easy integration of [Unleash](https://github.com/unleash/unleash) feature flags in a [Next.js](https://nextjs.org/) application.

## Setup

### Installation

To install, simply run:

```sh
npm install @unleash/nextjs
# or
yarn add @unleash/nextjs
# or
pnpm add @unleash/nextjs
```

### Environment variables

This package will attempt to load configuration from
[Next.js Environment variables](https://nextjs.org/docs/basic-features/environment-variables).

When using Unleash **client-side**, with `<FlagProvider />` or `getFrontendFlags()` configure:

  - `NEXT_PUBLIC_UNLEASH_FRONTEND_API_URL`. URL should end with `/api/frontend` or `/proxy`
  - `NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN` [client-side Unleash token](https://docs.getunleash.io/reference/api-tokens-and-client-keys#front-end-tokens)

If using **server-side** (SSR, SSG, API), using `getDefinitions()` and `evaluateFlags()`, set:

  - `UNLEASH_SERVER_API_URL` of you instance. URL should end with `/api`
  - `UNLEASH_SERVER_API_TOKEN` [server-side Unleash client token](https://docs.getunleash.io/reference/api-tokens-and-client-keys#client-tokens)

#### Detailed explanation

| Prefixable     | Variable                     | Default                                                   |
| -------------- | ---------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_` | `UNLEASH_SERVER_API_URL`     | `http://localhost:4242/api`                               |
| `NEXT_PUBLIC_` | `UNLEASH_FRONTEND_API_URL`   | `<(NEXT_PUBLIC_)UNLEASH_SERVER_API_URL>` `/frontend`      |
| **No**         | `UNLEASH_SERVER_API_TOKEN`   | `default:development.unleash-insecure-api-token`          |
| `NEXT_PUBLIC_` | `UNLEASH_FRONTEND_API_TOKEN` | `default:development.unleash-insecure-frontend-api-token` |
| `NEXT_PUBLIC_` | `UNLEASH_APP_NAME`           | `nextjs`                                                  |

If you plan to use configuration in the browser, add `NEXT_PUBLIC_` prefix.
If both are defined and available, private variable takes priority.
You can use both to have different values on client-side and server-side.

<br/>

# Usage

## A). Client-side only - simple use case and for development purposes (CSR)

Fastest way to get started is to connect frontend directly to Unleash.
You can find out more about direct [Front-end API access](https://docs.getunleash.io/reference/front-end-api) in our documentation,
including a guide on how to [setup a client-side SDK key](https://docs.getunleash.io/how-to/how-to-create-api-tokens).

```tsx
import type { AppProps } from "next/app";
import { FlagProvider } from "@unleash/nextjs";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FlagProvider>
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

Optional configuration is available with `config` prop. It will take priority over environment variables.

```jsx
<FlagProvider
  config={{
    url: "http://localhost:4242/api/frontend", // this will override NEXT_PUBLIC_UNLEASH_FRONTEND_API_URL
    clientKey: "<Frontend_API_token>", // NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN
    appName: "nextjs", // NEXT_PUBLIC_UNLEASH_APP_NAME

    refreshInterval: 15, // additional client configuration
    // see https://github.com/Unleash/unleash-proxy-client-js#available-options
  }}
>
```

If you only plan to use [Unleash client-side React SDK](https://github.com/Unleash/proxy-client-react) now also works with Next.js. Check documentation there for more examples.

<br />

## B). Static Site Generation, optimized performance (SSG)

With same access as in the client-side example above you can resolve Unleash feature flags when building static pages.

```tsx
import {
  flagsClient,
  getDefinitions,
  evaluateFlags,
  // getFrontendFlags,
  type IVariant,
} from "@unleash/nextjs";
import type { GetStaticProps, NextPage } from "next";

type Data = {
  isEnabled: boolean;
  variant: IVariant;
};

const ExamplePage: NextPage<Data> = ({ isEnabled, variant }) => (
  <>
    Flag status: {isEnabled ? "ENABLED" : "DISABLED"}
    <br />
    Variant: {variant.name}
  </>
);

export const getStaticProps: GetStaticProps<Data> = async (_ctx) => {
  /* Using server-side SDK: */
  const definitions = await getDefinitions();
  const { toggles } = evaluateFlags(definitions);

  /* Or with Proxy/Frontend API */
  // const { toggles } = await getFrontendFlags();

  const flags = flagsClient(toggles);

  return {
    props: {
      isEnabled: flags.isEnabled("nextjs-poc"),
      variant: flags.getVariant("nextjs-poc"),
    },
  };
};

export default ExamplePage;
```

The same approach will work for [ISR (Incremental Static Regeneration)](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration).

Both `getDefinitions()` and `getFrontendFlags()` can take arguments overriding URL, token and other request parameters.

<br />

## C). Server Side Rendering (SSR)

```tsx
import {
  flagsClient,
  evaluateFlags,
  getDefinitions,
  type IVariant,
} from "@unleash/nextjs";
import type { GetServerSideProps, NextPage } from "next";

type Data = {
  isEnabled: boolean;
};

const ExamplePage: NextPage<Data> = ({ isEnabled }) => (
  <>Flag status: {isEnabled ? "ENABLED" : "DISABLED"}</>
);

export const getServerSideProps: GetServerSideProps<Data> = async (ctx) => {
  const sessionId =
    ctx.req.cookies["unleash-session-id"] ||
    `${Math.floor(Math.random() * 1_000_000_000)}`;
  ctx.res.setHeader("set-cookie", `unleash-session-id=${sessionId}; path=/;`);

  const context = {
    sessionId, // needed for stickiness
    // userId: "123" // etc
  };

  const { toggles } = await getFrontendFlags(); // Use Proxy/Frontend API
  const flags = flagsClient(toggles);

  return {
    props: {
      isEnabled: flags.isEnabled("nextjs-poc"),
    },
  };
};

export default ExamplePage;
```

<br />

## D). Bootstrapping / rehydration

You can bootstrap Unleash React SDK to have values loaded from the start.
Initial value can be customized server-side.

```tsx
import App, { AppContext, type AppProps } from "next/app";
import {
  FlagProvider,
  getFrontendFlags,
  type IMutableContext,
  type IToggle,
} from "@unleash/nextjs";

type Data = {
  toggles: IToggle[];
  context: IMutableContext;
};

export default function CustomApp({
  Component,
  pageProps,
  toggles,
  context,
}: AppProps & Data) {
  return (
    <FlagProvider
      config={{
        bootstrap: toggles,
        context,
      }}
    >
      <Component {...pageProps} />
    </FlagProvider>
  );
}

CustomApp.getInitialProps = async (ctx: AppContext) => {
  const context = {
    userId: "123",
  };

  const { toggles } = await getFrontendFlags(); // use Unleash Proxy

  return {
    ...(await App.getInitialProps(ctx)),
    bootstrap: toggles,
    context, // pass context along so client can refetch correct values
  };
};
```

<br />

# What's next

## Experimental features support

Unleash Next.js SDK can run on [Edge Runtime](https://nextjs.org/docs/api-reference/edge-runtime) and in [Middleware](https://nextjs.org/docs/advanced-features/middleware). We are also interested in providing an example with [App Directory](https://beta.nextjs.org/docs/app-directory-roadmap).

## Known limitation

- In current interation server-side SDK does not support metrics.
- Server-side SDK does not support "Hostname" or "IP" strategy. Use custom context field and constraints instead.
