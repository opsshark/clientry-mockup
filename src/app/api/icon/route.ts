import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy Jira request type icon SVGs so they're same-origin.
 * This allows CSS mask-image to work for icon colorization.
 * Supports both direct site URLs and api.atlassian.com gateway URLs.
 * Gateway URLs require Bearer auth with the Jira API token.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Only allow Atlassian avatar URLs (direct site or gateway)
  const isValidUrl =
    url.includes("/rest/api/2/universal_avatar/") &&
    (url.includes("atlassian.net") || url.includes("api.atlassian.com"));

  if (!isValidUrl) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Gateway URLs (api.atlassian.com) require Bearer auth
  // Direct site URLs (*.atlassian.net) are public
  const headers: Record<string, string> = {};
  if (url.includes("api.atlassian.com")) {
    const token = process.env.JIRA_API_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 86400 },
  });
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
