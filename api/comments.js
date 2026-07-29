// Anonymous comments backed by Upstash Redis (REST API, no dependencies).
//
// Env vars — set automatically by the Vercel Upstash/KV marketplace integration:
//   KV_REST_API_URL / KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
//
// GET  /api/comments?slug=/some-post/   -> { comments: [...] }
// POST /api/comments  { slug, body, visitor } -> { comment: {...} }

const crypto = require("crypto");

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const MAX_BODY = 2000;
const MAX_COMMENTS_PER_POST = 500;
const RATE_LIMIT = 5; // comments...
const RATE_WINDOW = 600; // ...per 10 minutes, per IP

const ADJECTIVES = [
  "anonymous", "bewildered", "caffeinated", "deranged", "elusive", "feral",
  "gloomy", "haunted", "insomniac", "jaded", "lukewarm", "mildewed",
  "nocturnal", "obstinate", "perplexed", "quixotic", "rancid", "sullen",
  "tepid", "unhinged", "vaguely", "wistful", "yawning", "zealous",
  "concussed", "damp", "overcooked", "reluctant", "suspicious", "unemployed",
];

const NOUNS = [
  "goose", "mongoose", "raccoon", "possum", "heron", "gecko", "badger",
  "walrus", "otter", "magpie", "toad", "moth", "crab", "ferret", "newt",
  "vulture", "weasel", "pigeon", "hamster", "lemur", "stoat", "wombat",
  "axolotl", "capybara", "marmot", "shrimp", "eel", "puffin", "yak", "slug",
];

function redis(commands) {
  // commands: array of arrays, e.g. [["GET","k"],["RPUSH","l","v"]]
  return fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  }).then(async (res) => {
    if (!res.ok) throw new Error(`redis ${res.status}: ${await res.text()}`);
    const out = await res.json();
    const failed = out.find((r) => r && r.error);
    if (failed) throw new Error(`redis: ${failed.error}`);
    return out.map((r) => r.result);
  });
}

function randomName() {
  const pick = (arr) => arr[crypto.randomInt(arr.length)];
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}-${crypto.randomInt(1000, 10000)}`;
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd || "").split(",")[0].trim();
  return ip || req.socket?.remoteAddress || "unknown";
}

// Never store raw IPs — only a salted hash, used for rate limiting.
function ipKey(req) {
  const salt = REDIS_TOKEN || "howl";
  return crypto.createHash("sha256").update(clientIp(req) + salt).digest("hex").slice(0, 24);
}

// Slugs come from the client, so validate hard before they touch a key name.
function cleanSlug(raw) {
  if (typeof raw !== "string") return null;
  const slug = raw.trim();
  if (!slug || slug.length > 120) return null;
  if (!/^\/[a-z0-9\-_/]*$/i.test(slug)) return null;
  return slug;
}

function cleanVisitor(raw) {
  if (typeof raw !== "string") return null;
  return /^[a-z0-9-]{8,64}$/i.test(raw) ? raw : null;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16 * 1024) throw new Error("body too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(503).json({ error: "Comments are not configured yet." });
  }

  try {
    if (req.method === "GET") {
      const slug = cleanSlug(req.query.slug);
      if (!slug) return res.status(400).json({ error: "Bad slug." });

      const [raw] = await redis([["LRANGE", `comments:${slug}`, "0", "-1"]]);
      const comments = (raw || [])
        .map((item) => {
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      return res.status(200).json({ comments });
    }

    if (req.method === "POST") {
      const payload = await readJsonBody(req);

      // Honeypot: a real person never fills a field they cannot see.
      if (payload.website) return res.status(200).json({ comment: null });

      const slug = cleanSlug(payload.slug);
      if (!slug) return res.status(400).json({ error: "Bad slug." });

      const visitor = cleanVisitor(payload.visitor);
      if (!visitor) return res.status(400).json({ error: "Bad visitor id." });

      const body = typeof payload.body === "string" ? payload.body.trim() : "";
      if (!body) return res.status(400).json({ error: "Say something first." });
      if (body.length > MAX_BODY) {
        return res.status(400).json({ error: `Keep it under ${MAX_BODY} characters.` });
      }

      const rlKey = `rl:${ipKey(req)}`;
      const [hits] = await redis([["INCR", rlKey]]);
      if (hits === 1) await redis([["EXPIRE", rlKey, String(RATE_WINDOW)]]);
      if (hits > RATE_LIMIT) {
        return res.status(429).json({ error: "Slow down — try again in a few minutes." });
      }

      const [count] = await redis([["LLEN", `comments:${slug}`]]);
      if (count >= MAX_COMMENTS_PER_POST) {
        return res.status(409).json({ error: "This thread is full." });
      }

      // One visitor keeps the same handle across comments and across posts.
      const nameKey = `name:${visitor}`;
      let [name] = await redis([["GET", nameKey]]);
      if (!name) {
        name = randomName();
        await redis([["SET", nameKey, name]]);
      }

      const comment = { name, body, ts: Date.now() };
      await redis([["RPUSH", `comments:${slug}`, JSON.stringify(comment)]]);

      return res.status(201).json({ comment });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    console.error("comments:", err);
    return res.status(500).json({ error: "Something broke. Try again later." });
  }
};
