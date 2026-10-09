const AI_CRAWLER_USER_AGENT_PATTERN =
  /(anthropic-ai|Applebot-Extended|Bytespider|CCBot|ChatGPT-User|Claude-Web|ClaudeBot|cohere-ai|Diffbot|FacebookBot|Google-Extended|GPTBot|meta-externalagent|OAI-SearchBot|omgili|PerplexityBot|YouBot)/i;

const SCRIPTED_CLIENT_USER_AGENT_PATTERN =
  /(aiohttp|axios|curl|Go-http-client|httpx|node-fetch|python-requests|scrapy|wget)/i;

const VERIFIED_SEARCH_CRAWLER_USER_AGENT_PATTERN =
  /(Bingbot|Googlebot|Google-InspectionTool)/i;

const SOCIAL_PREVIEW_USER_AGENT_PATTERN =
  /(Discordbot|facebookexternalhit|LinkedInBot|Slackbot|Twitterbot|WhatsApp)/i;

const EXPENSIVE_PUBLIC_PATH_PATTERN =
  /^\/($|activities(?:\/|$)|ai-docs(?:\/|$)|api(?:\/|$)|jess(?:\/|$)|notes(?:\/|$)|page(?:\/|$)|posts(?:\/|$)|projects(?:\/|$)|rafa(?:\/|$)|search(?:\/|$)|topics(?:\/|$)|_next\/image(?:\?|$))/;

// Uncached or private surfaces: closed to every bot, AI crawlers included.
const BOT_RESTRICTED_PATH_PATTERN =
  /^\/(?:admin|api|playground|(?:[^/]+\/)?search)(?:\/|$)/;

const HOSTILE_PROBE_PATH_PATTERN =
  /^\/(?:(?:[^/]+\/)*\.env(?:$|[./_-].*)|(?:[^/]+\/)*[^/]+\.(?:php[0-9]*|phtml|phar|py)(?:$|[/?])|(?:[^/]+\/)*[^/]+\.(?:dat|bak|backup|old|orig|save|sql|sqlite|db|zip|tar|tgz|gz|rar|7z|log|ini|conf)(?:$|[/?])|\.git(?:\/|$)|wp-(?:admin|content|includes|login)(?:\/|\.php|$)|wordpress(?:\/|$)|server-status(?:\/|$)|actuator(?:\/|$))/;

export function getRequestUserAgent(headers: Headers) {
  return headers.get("user-agent") || "";
}

export function isAiCrawlerUserAgent(userAgent: string) {
  return AI_CRAWLER_USER_AGENT_PATTERN.test(userAgent);
}

export function isScriptedClientUserAgent(userAgent: string) {
  return SCRIPTED_CLIENT_USER_AGENT_PATTERN.test(userAgent);
}

export function isVerifiedSearchCrawlerUserAgent(userAgent: string) {
  return VERIFIED_SEARCH_CRAWLER_USER_AGENT_PATTERN.test(userAgent);
}

export function isSocialPreviewUserAgent(userAgent: string) {
  return SOCIAL_PREVIEW_USER_AGENT_PATTERN.test(userAgent);
}

export function isHostileProbePath(pathname: string) {
  return HOSTILE_PROBE_PATH_PATTERN.test(pathname);
}

export function isExpensivePublicPath(pathname: string) {
  return EXPENSIVE_PUBLIC_PATH_PATTERN.test(pathname);
}

export function isBotRestrictedPath(pathname: string) {
  return BOT_RESTRICTED_PATH_PATTERN.test(pathname);
}

export function shouldBlockExpensiveBotRequest(
  pathname: string,
  userAgent: string
) {
  if (
    isVerifiedSearchCrawlerUserAgent(userAgent) ||
    isSocialPreviewUserAgent(userAgent)
  ) {
    return false;
  }

  if (isScriptedClientUserAgent(userAgent)) {
    return isExpensivePublicPath(pathname) || isBotRestrictedPath(pathname);
  }

  // AI crawlers may read public pages, which the CDN serves from cache.
  return isAiCrawlerUserAgent(userAgent) && isBotRestrictedPath(pathname);
}
