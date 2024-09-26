import {
  evaluateFlags,
  flagsClient,
  getDefinitions,
} from "@unleash/nextjs";
import type { NextRequest } from "next/server";
export const runtime = "edge";
export const preferredRegion = "fra1";
import { UNLEASH_COOKIE_NAME } from "../../utils";

export async function GET(request: NextRequest) {
  const sessionId =
    request.cookies.get(UNLEASH_COOKIE_NAME)?.value ||
    `${Math.floor(Math.random() * 1_000_000_000)}`;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Set-Cookie": `${UNLEASH_COOKIE_NAME}=${sessionId}`,
  };

  try {
    const definitions = await getDefinitions();
    const { toggles } = evaluateFlags(definitions, {
      sessionId,
    });
    const flags = flagsClient(toggles);
    return new Response(
      JSON.stringify({
        activeToggles: toggles.length,
        exampleToggle: {
          url: "https://app.unleash-hosted.com/demo/projects/codesandbox/features/example-flag",
          isEnabled: flags.isEnabled("example-flag"),
          variant: flags.getVariant("example-flag"),
        },
      }),
      {
        status: 200,
        statusText: "OK",
        headers,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: (error as Error)?.message || "Internal Server Error",
      }),
      {
        status: 500,
        statusText: "Internal Server Error",
        headers,
      }
    );
  }
};
