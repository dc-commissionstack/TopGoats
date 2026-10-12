import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "Top Goats — The Sovereign Platform for Independent Artists",
      },
      {
        name: "description",
        content:
          "Own your sound. No gatekeepers. The all-in-one ecosystem for underground artists — sovereign pages, IP protection, $1 songs, and direct-to-fan commerce.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center bg-[#050505] text-gray-400 text-lg">
      Page not found
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="noise-bg">
      <head>
        <HeadContent />
      </head>
      <body className="scanlines font-sans">
        {children}
        <Scripts />
      </body>
    </html>
  );
}