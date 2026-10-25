import axios from "axios";
import crypto from "crypto";
import { XMLParser } from "fast-xml-parser";

export type NewsCategory = "forex" | "crypto";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string | null;
  url: string;
  source: string;
  category: NewsCategory;
  publishedAt: string; // ISO date
}

// Public RSS feeds. Each article links back to its source.
const FEEDS: { source: string; category: NewsCategory; url: string }[] = [
  { source: "FXStreet", category: "forex", url: "https://www.fxstreet.com/rss/news" },
  { source: "FXStreet", category: "forex", url: "https://www.fxstreet.com/rss/analysis" },
  { source: "ActionForex", category: "forex", url: "https://www.actionforex.com/feed/" },
  { source: "BabyPips", category: "forex", url: "https://www.babypips.com/feed.rss" },
  { source: "ForexCrunch", category: "forex", url: "https://www.forexcrunch.com/feed/" },
  { source: "CoinDesk", category: "crypto", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { source: "Cointelegraph", category: "crypto", url: "https://cointelegraph.com/rss" },
  { source: "Decrypt", category: "crypto", url: "https://decrypt.co/feed" },
];

const CACHE_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 10000;
const DESCRIPTION_LENGTH = 280;
const MAX_PAGE_SIZE = 50;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  cdataPropName: "#cdata",
  processEntities: true,
  htmlEntities: true,
});

let cache: { at: number; articles: NewsArticle[] } | null = null;
let inFlight: Promise<NewsArticle[]> | null = null;

const asArray = <T>(value: T | T[] | undefined): T[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

// Text of a parsed node, whether it was plain text, CDATA or text with attributes.
function text(node: any): string {
  if (node === undefined || node === null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return text(node[0]);
  return text(node["#cdata"] ?? node["#text"] ?? "");
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—" };

function decodeEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

// Plain text from HTML: no tags, scripts or styles, single spaces.
function plainText(html: string) {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>|<\/p>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

// Shortens at a word boundary and adds an ellipsis when cut.
function excerpt(value: string, length = DESCRIPTION_LENGTH) {
  if (value.length <= length) return value;
  const cut = value.slice(0, length);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), length - 40)).replace(/[\s,.;:–-]+$/, "") + "…";
}

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

// Best image for an item: media:content / media:thumbnail / enclosure, then the first <img> in the body.
function imageOf(item: any, html: string): string | null {
  const candidates: string[] = [];
  for (const media of asArray(item["media:content"])) {
    const url = media?.["@_url"];
    const medium = media?.["@_medium"];
    const type = media?.["@_type"] || "";
    if (url && (!medium || medium === "image") && (!type || type.startsWith("image"))) candidates.push(url);
  }
  for (const thumb of asArray(item["media:thumbnail"])) if (thumb?.["@_url"]) candidates.push(thumb["@_url"]);
  for (const group of asArray(item["media:group"])) {
    for (const media of asArray(group?.["media:content"])) if (media?.["@_url"]) candidates.push(media["@_url"]);
  }
  for (const enclosure of asArray(item.enclosure)) {
    const type = enclosure?.["@_type"] || "";
    if (enclosure?.["@_url"] && (!type || type.startsWith("image"))) candidates.push(enclosure["@_url"]);
  }
  const img = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  if (img) candidates.push(img[1]);

  const url = candidates.map((c) => decodeEntities(String(c)).trim()).find(isHttpUrl);
  return url ? url.replace(/^http:\/\//i, "https://") : null;
}

function toArticle(item: any, feed: (typeof FEEDS)[number]): NewsArticle | null {
  const title = plainText(text(item.title));
  const link = decodeEntities(text(item.link) || text(item.guid)).trim();
  if (!title || !isHttpUrl(link)) return null;

  const html = text(item["content:encoded"]) || text(item.description);
  const description = excerpt(
    plainText(text(item.description) || html)
      // WordPress feeds append "The post <title> appeared first on <site>."
      .replace(/\s*The post .{0,300}? appeared first on [^.]{1,80}\.?\s*$/i, "")
      .trim(),
  );
  const date = new Date(text(item.pubDate) || text(item["dc:date"]) || text(item.published));
  if (Number.isNaN(date.getTime())) return null;

  return {
    id: crypto.createHash("sha1").update(link).digest("hex").slice(0, 16),
    title,
    description,
    image: imageOf(item, html),
    url: link,
    source: feed.source,
    category: feed.category,
    publishedAt: date.toISOString(),
  };
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<NewsArticle[]> {
  const response = await axios.get(feed.url, {
    timeout: TIMEOUT_MS,
    responseType: "text",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KingFriendNews/1.0)", Accept: "application/rss+xml, application/xml, text/xml" },
    maxContentLength: 5 * 1024 * 1024,
  });
  const xml = parser.parse(response.data);
  const items = asArray(xml?.rss?.channel?.item);
  return items.map((item) => toArticle(item, feed)).filter((a): a is NewsArticle => a !== null);
}

// All articles from every feed, newest first, without duplicates. A failing feed is skipped.
async function loadAll(): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  results.forEach((result, i) => {
    if (result.status === "rejected") console.warn(`[news] ${FEEDS[i].source} feed failed:`, result.reason?.message);
  });

  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const now = Date.now();
  return results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    // Feeds sometimes carry future-dated items; don't let them sit on top.
    .filter((a) => new Date(a.publishedAt).getTime() <= now + 5 * 60 * 1000)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter((a) => {
      const titleKey = a.title.toLowerCase();
      if (seenUrls.has(a.url) || seenTitles.has(titleKey)) return false;
      seenUrls.add(a.url);
      seenTitles.add(titleKey);
      return true;
    });
}

async function articles(): Promise<NewsArticle[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.articles;
  if (!inFlight) {
    inFlight = loadAll()
      .then((list) => {
        // Keep the previous list if every feed failed this time.
        if (list.length || !cache) cache = { at: Date.now(), articles: list };
        return cache.articles;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export default class NewsService {
  static async list(query: { category?: string; page?: string | number; pageSize?: string | number; search?: string }) {
    const category = query.category === "forex" || query.category === "crypto" ? query.category : "all";
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(String(query.pageSize ?? 12), 10) || 12));
    const search = String(query.search ?? "").trim().toLowerCase().slice(0, 100);

    const all = await articles();
    const filtered = all.filter(
      (a) =>
        (category === "all" || a.category === category) &&
        (!search || a.title.toLowerCase().includes(search) || a.description.toLowerCase().includes(search)),
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const page = Math.min(totalPages, Math.max(1, parseInt(String(query.page ?? 1), 10) || 1));
    return {
      rows: filtered.slice((page - 1) * pageSize, page * pageSize),
      count: filtered.length,
      page,
      pageSize,
      totalPages,
      updatedAt: cache ? new Date(cache.at).toISOString() : null,
    };
  }
}
