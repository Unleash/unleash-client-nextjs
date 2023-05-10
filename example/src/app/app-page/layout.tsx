import type { ReactNode, FC } from "react";
import { Page } from "@vercel/examples-ui";
import "@vercel/examples-ui/globals.css";

export default function Layout({ children }: { children: ReactNode }) {
  return <Page>{children}</Page>;
}
