import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy Jira request type icon SVGs so they're same-origin.
 * This allows CSS mask-image to work for icon colorization.
 * Accepts any Atlassian-hosted avatar/icon URL.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Only allow Atlassian-hosted URLs
  const isValidUrl =
    url.includes("atlassian.net") || url.includes("api.atlassian.com");

  if (!isValidUrl) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    // Direct site URLs (*.atlassian.net) are typically public for avatars
    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Fetch failed: ${res.status}` },
        { status: 502 }
      );
    }

    const body = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/svg+xml";

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch error" }, { status: 502 });
  }
}
