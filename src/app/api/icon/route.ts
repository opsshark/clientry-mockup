import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy Jira request type icon SVGs so they're same-origin.
 * This allows CSS mask-image to work for icon colorization.
 * Usage: /api/icon?url=https://demostudio.atlassian.net/rest/api/2/universal_avatar/...
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Only allow Atlassian avatar URLs
  if (!url.includes("atlassian.net/rest/api/2/universal_avatar/")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }

  const body = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") || "image/svg+xml";

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
