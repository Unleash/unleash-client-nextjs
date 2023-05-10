import type { NextRequest } from "next/server";
import {
  type Context,
  randomSessionId,
  evaluateFlags,
  getDefinitions,
} from "@unleash/nextjs";
import { UNLEASH_COOKIE_NAME } from "../../utils";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    const sessionId =
      req.nextUrl.searchParams.get("sessionId") ||
      req.cookies.get(UNLEASH_COOKIE_NAME)?.value ||
      randomSessionId();
    const remoteAddress =
      req.nextUrl.searchParams.get("remoteAddress") ||
      req.headers.get("x-forwarded-for") ||
      req.ip;

    const context: Context = {
      userId: req.nextUrl.searchParams.get("userId") || undefined,
      sessionId,
      remoteAddress,
    };

    const definitions = await getDefinitions();
    const { toggles } = await evaluateFlags(definitions, context);

    return new Response(JSON.stringify({ toggles }), {
      status: 200,
      headers: {
        "no-cache": "no-cache",
        "content-type": "application/json",
        "set-cookie": `${UNLEASH_COOKIE_NAME}=${sessionId}; path=/;`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 500,
        error: "Internal Server Error",
        message: (error as Error)?.message || undefined,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
}
