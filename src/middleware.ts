/**
 * Links to other sites open in a new tab (owner's rule, 2026-10-16).
 *
 * Done once here instead of on every <a>: the pages are prerendered, so this
 * runs at build time over each page's HTML and adds target="_blank" and
 * rel="noopener noreferrer" to every absolute http(s) link whose host is not
 * this site's. Links inside the site are left alone.
 */
import { defineMiddleware } from "astro:middleware";

const external = /<a\s([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/g;

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;

  const siteHost = context.site?.host;
  const html = (await response.text()).replace(external, (tag, before: string, href: string, after: string) => {
    if (siteHost && new URL(href).host === siteHost) return tag;
    if (/\btarget=/.test(before + after)) return tag;
    return `<a ${before}href="${href}"${after} target="_blank" rel="noopener noreferrer">`;
  });
  return new Response(html, { status: response.status, headers: response.headers });
});
