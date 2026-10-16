export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");
  if (!target) return new Response("Missing url", { status: 400 });
  try {
    const origin = new URL(target).origin;
    const res = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Referer": origin + "/",
        "Accept": "text/html",
      },
    });
    let html = await res.text();
    html = html
      .replace(/href="\/(?!\/)/g, `href="${origin}/`)
      .replace(/src="\/(?!\/)/g, `src="${origin}/`);
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Embed server down", { status: 502 });
  }
}
