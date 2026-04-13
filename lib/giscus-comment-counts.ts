interface GitHubDiscussion {
  title?: string;
  comments?: number;
  category?: {
    node_id?: string;
  };
}

const GITHUB_API_BASE = 'https://api.github.com';
const GISCUS_REPO = '0xharkirat/beautiful-hark';
const GISCUS_CATEGORY_ID = 'DIC_kwDOQph0X84C3gWD';

function normalizeDiscussionTerm(term: string): string {
  return term.replace(/^\/+/, '').replace(/\/+$/, '');
}

export async function getGiscusCommentCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${GISCUS_REPO}/discussions?per_page=100&page=${page}&state=all`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return counts;
    }

    const discussions = (await response.json()) as GitHubDiscussion[];

    if (!Array.isArray(discussions) || discussions.length === 0) {
      break;
    }

    for (const discussion of discussions) {
      if (discussion.category?.node_id !== GISCUS_CATEGORY_ID || !discussion.title) {
        continue;
      }

      const key = normalizeDiscussionTerm(discussion.title);
      counts[key] = discussion.comments ?? 0;
    }

    if (discussions.length < 100) {
      break;
    }
  }

  return counts;
}
