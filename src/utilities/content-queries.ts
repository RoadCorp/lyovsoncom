import type { Where } from "payload";

export function publishedPostsWhere(): Where {
  return {
    _status: {
      equals: "published",
    },
  };
}

export function publicActivitiesWhere(): Where {
  return {
    _status: {
      equals: "published",
    },
    visibility: {
      equals: "public",
    },
  };
}

export function publishedProjectsWhere(): Where {
  return {
    _status: {
      equals: "published",
    },
  };
}

/** Published projects that credit this person. */
export function lyovsonPortfolioWhere(lyovsonId: number): Where {
  return {
    people: {
      contains: lyovsonId,
    },
    ...publishedProjectsWhere(),
  };
}

/** Other published projects that credit any of these people. */
export function moreWorkWhere(peopleIds: number[], excludeId: number): Where {
  return {
    people: {
      in: peopleIds,
    },
    id: {
      not_equals: excludeId,
    },
    ...publishedProjectsWhere(),
  };
}

export function projectPostsWhere(projectId: number): Where {
  return {
    project: {
      equals: projectId,
    },
    ...publishedPostsWhere(),
  };
}

export function topicPostsWhere(topicId: number): Where {
  return {
    topics: {
      contains: topicId,
    },
    ...publishedPostsWhere(),
  };
}

export function lyovsonPostsWhere(lyovsonId: number): Where {
  return {
    authors: {
      contains: lyovsonId,
    },
    ...publishedPostsWhere(),
  };
}

export function lyovsonActivitiesWhere(lyovsonId: number): Where {
  return {
    ...publicActivitiesWhere(),
    OR: [
      {
        participants: {
          contains: lyovsonId,
        },
      },
      {
        "reviews.lyovson": {
          equals: lyovsonId,
        },
      },
    ],
  };
}
