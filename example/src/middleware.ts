import { NextRequest, NextResponse } from "next/server";
import { UNLEASH_API_PROXY_DEFINITIONS, UNLEASH_COOKIE_NAME } from "./utils";
import { addBasePath } from "next/dist/client/add-base-path";
import { flagsClient, evaluateFlags, randomSessionId } from "@unleash/nextjs";

export const config = {
  runtime: "experimental-edge",
};

export async function middleware(req: NextRequest) {
  const sessionId =
    req.cookies.get(UNLEASH_COOKIE_NAME)?.value || randomSessionId();
  let res: NextResponse;
  if (req.nextUrl.pathname.startsWith("/ab")) {
    const context = { sessionId }; // You can extend context with other server-side properties

    // Grab definitions from an endpoint cached on the edge
    const protocol = req.url.startsWith("https") ? "https://" : "http://";
    const host = req.headers.get("host");
    const endpoint = addBasePath(UNLEASH_API_PROXY_DEFINITIONS);
    const token = process.env.UNLEASH_RELAY_SECRET || "";
    const definitionsUrl = `${protocol}${host}${endpoint}?token=${token}`;

    // Make a request to the edge-cached endpoint
    const definitions = await fetch(definitionsUrl).then((res) => res.json());

    // Evaluate based on provided context
    const evaluated = await evaluateFlags(definitions, context);
    const flags = flagsClient(evaluated.toggles);

    // Check if the `EnableImpel` flag is turned on for this client
    const isImpel = flags.isEnabled("EnableImpel");

    const newUrl = req.nextUrl.clone();
    // Redirect to variant
    newUrl.pathname = `/ab/${isImpel ? "a" : "b"}`;
    res = NextResponse.rewrite(newUrl);
  } else {
    res = NextResponse.next();
  }
  res.cookies.set(UNLEASH_COOKIE_NAME, sessionId);
  return res;
}
