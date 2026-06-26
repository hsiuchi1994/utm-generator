export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('Missing url parameter', { status: 400 });
  }

  const res = await fetch(
    'https://is.gd/create.php?format=simple&url=' + encodeURIComponent(url)
  );
  const short = await res.text();

  return new Response(short.trim(), {
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const config = { runtime: 'edge' };
