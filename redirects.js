const redirects = () => {
  const internetExplorerRedirect = {
    destination: "/ie-incompatible.html",
    has: [
      {
        type: "header",
        key: "user-agent",
        value: "(.*Trident.*)", // all ie browsers
      },
    ],
    permanent: false,
    source: "/:path((?!ie-incompatible.html$).*)", // all pages except the incompatibility page
  };

  const newsletterArchiveRedirects = [
    {
      source: "/subscription-confirmed",
      destination: "/",
      permanent: false,
    },
    {
      source: "/site.webmanifest",
      destination: "/manifest.webmanifest",
      permanent: true,
    },
    {
      source: "/api/confirm-subscription",
      destination: "/",
      permanent: false,
    },
  ];

  // All specific post redirects - Generated from database query
  // This ensures every published post has an explicit redirect
  const specificPostRedirects = [
    // media-musings posts
    {
      source:
        "/media-musings/a-vardavar-tale-my-water-drenched-childhood-trauma",
      destination: "/posts/a-vardavar-tale-my-water-drenched-childhood-trauma",
      permanent: true,
    },
    {
      source: "/media-musings/bye-bye-apple-tv",
      destination: "/posts/bye-bye-apple-tv",
      permanent: true,
    },
    {
      source: "/media-musings/more-work-vs-good-work",
      destination: "/posts/more-work-vs-good-work",
      permanent: true,
    },
    {
      source: "/media-musings/quell-the-sequels-the-capitalism-of-familiarity",
      destination: "/posts/quell-the-sequels-the-capitalism-of-familiarity",
      permanent: true,
    },
    {
      source: "/media-musings/slow-horses-personified",
      destination: "/posts/slow-horses-personified",
      permanent: true,
    },
    {
      source: "/media-musings/stardew-valley-sucks-you-in",
      destination: "/posts/stardew-valley-sucks-you-in",
      permanent: true,
    },
    {
      source: "/media-musings/stress--success",
      destination: "/posts/stress--success",
      permanent: true,
    },
    {
      source:
        "/media-musings/the-truth-vs-an-opinion-how-to-become-the-media-that-wont-suck",
      destination:
        "/posts/the-truth-vs-an-opinion-how-to-become-the-media-that-wont-suck",
      permanent: true,
    },
    // x-files posts
    {
      source: "/x-files/first-things-first-x-articles",
      destination: "/posts/first-things-first-x-articles",
      permanent: true,
    },
    {
      source: "/x-files/in-what-we-trust",
      destination: "/posts/in-what-we-trust",
      permanent: true,
    },
    {
      source: "/x-files/omarchy-btw",
      destination: "/posts/omarchy-btw",
      permanent: true,
    },
    {
      source: "/x-files/siri--gemini-somehow-it-makes-sense",
      destination: "/posts/siri--gemini-somehow-it-makes-sense",
      permanent: true,
    },
  ];

  // Redirect old project index pages to new format
  const projectIndexRedirects = [
    {
      source: "/media-musings",
      destination: "/projects/media-musings",
      permanent: true,
    },
    {
      source: "/x-files",
      destination: "/projects/x-files",
      permanent: true,
    },
  ];

  const allRedirects = [
    internetExplorerRedirect,
    ...newsletterArchiveRedirects,
    ...specificPostRedirects,
    ...projectIndexRedirects,
  ];

  return allRedirects;
};

export default redirects;
