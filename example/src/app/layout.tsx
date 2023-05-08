import type { ReactNode } from "react";

export const metadata = {
  title: "Unleash Next.js App Directory Example",
  description: "New approach to server-side rendering",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
