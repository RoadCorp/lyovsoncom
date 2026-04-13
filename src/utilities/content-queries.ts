import type { Where } from "payload";
import type { Note } from "@/payload-types";

export const NOTE_AUTHOR_BY_USERNAME = {
  rafa: "rafa",
  jess: "jess",
} as const satisfies Record<string, NonNullable<Note["author"]>>;

export function publishedPostsWhere(): Where {
  return {
    _status: {
      equals: "published",
    },
  };
}

export function publicNotesWhere(): Where {
  return {
    _status: {
      equals: "published",
    },
    visibility: {
      equals: "public",
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

export function getNoteAuthorByUsername(username: string) {
  return (
    NOTE_AUTHOR_BY_USERNAME[username as keyof typeof NOTE_AUTHOR_BY_USERNAME] ||
    null
  );
}

export function lyovsonNotesWhere(username: string): Where | null {
  const noteAuthor = getNoteAuthorByUsername(username);

  if (!noteAuthor) {
    return null;
  }

  return {
    author: {
      equals: noteAuthor,
    },
    ...publicNotesWhere(),
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
