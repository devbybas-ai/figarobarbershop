import { NextResponse } from "next/server";

interface InstagramMedia {
  id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

interface InstagramResponse {
  data: InstagramMedia[];
}

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken || accessToken === "placeholder") {
    // Return sample data when Instagram is not configured
    return NextResponse.json({
      data: [],
      configured: false,
    });
  }

  try {
    const url =
      "https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,caption,timestamp&limit=8";
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ data: [], configured: true, error: "Failed to fetch" });
    }

    const data: InstagramResponse = await res.json();
    return NextResponse.json({ data: data.data, configured: true });
  } catch {
    return NextResponse.json({ data: [], configured: true, error: "Failed to fetch" });
  }
}
