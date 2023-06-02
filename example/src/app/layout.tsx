import type { ReactNode } from "react";
import { Page } from "@vercel/examples-ui";
import "@vercel/examples-ui/globals.css";

export const metadata = {
  title: "Unleash Next.js App Directory Example",
  description: "New approach to server-side rendering",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Page>{children}</Page>
      </body>
    </html>
  );
}
