const AI_CRAWLER_USER_AGENT_PATTERN =
  /(anthropic-ai|Applebot-Extended|Bytespider|CCBot|ChatGPT-User|Claude-Web|ClaudeBot|cohere-ai|Diffbot|FacebookBot|Google-Extended|GPTBot|meta-externalagent|OAI-SearchBot|omgili|PerplexityBot|YouBot)/i;

const SCRIPTED_CLIENT_USER_AGENT_PATTERN =
  /(aiohttp|axios|curl|Go-http-client|httpx|node-fetch|python-requests|scrapy|wget)/i;

const VERIFIED_SEARCH_CRAWLER_USER_AGENT_PATTERN =
  /(Bingbot|Googlebot|Google-InspectionTool)/i;

const SOCIAL_PREVIEW_USER_AGENT_PATTERN =
  /(Discordbot|facebookexternalhit|LinkedInBot|Slackbot|Twitterbot|WhatsApp)/i;

const EXPENSIVE_PUBLIC_PATH_PATTERN =
  /^\/($|activities(?:\/|$)|ai-docs(?:\/|$)|api(?:\/|$)|jess(?:\/|$)|notes(?:\/|$)|page(?:\/|$)|posts(?:\/|$)|projects(?:\/|$)|rafa(?:\/|$)|topics(?:\/|$)|_next\/image(?:\?|$))/;

const HOSTILE_PROBE_PATH_PATTERN =
  /^\/(?:(?:[^/]+\/)*\.env(?:$|[./_-].*)|(?:[^/]+\/)*[^/]+\.php$|\.git(?:\/|$)|wp-(?:admin|content|includes|login)(?:\/|\.php|$)|wordpress(?:\/|$)|server-status(?:\/|$))/;

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

  return (
    isExpensivePublicPath(pathname) &&
    (isAiCrawlerUserAgent(userAgent) || isScriptedClientUserAgent(userAgent))
  );
}
