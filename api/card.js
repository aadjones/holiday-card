/**
 * API route for saving and loading cards
 *
 * POST /api/card - Save a card config, returns { id }
 * GET /api/card?id=xxx - Load a card config by ID
 */

export const config = {
  runtime: 'edge',
};

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

/**
 * Generate a short random ID
 */
function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Make a request to Upstash Redis REST API
 */
async function redis(command, ...args) {
  const response = await fetch(`${KV_REST_API_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
}

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    // GET - Load a card
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing id parameter' }),
          { status: 400, headers }
        );
      }

      const cardJson = await redis('GET', `card:${id}`);

      if (!cardJson) {
        return new Response(
          JSON.stringify({ error: 'Card not found' }),
          { status: 404, headers }
        );
      }

      return new Response(cardJson, { status: 200, headers });
    }

    // POST - Save a card
    if (req.method === 'POST') {
      const body = await req.json();

      if (!body.config) {
        return new Response(
          JSON.stringify({ error: 'Missing config in request body' }),
          { status: 400, headers }
        );
      }

      const id = generateId();
      const cardJson = JSON.stringify(body.config);

      // Store with 90 day expiration (in seconds)
      const expireSeconds = 90 * 24 * 60 * 60;
      await redis('SET', `card:${id}`, cardJson, 'EX', expireSeconds);

      return new Response(
        JSON.stringify({ id }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  } catch (err) {
    console.error('API error:', err);

    // Handle Upstash size limit error
    if (err.message?.includes('max request size exceeded')) {
      return new Response(
        JSON.stringify({ error: 'Card is too large. Try using smaller images.' }),
        { status: 413, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers }
    );
  }
}
