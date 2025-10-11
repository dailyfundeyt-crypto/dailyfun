import { Article } from '../data/articles';

interface ArticleWithEngagement extends Article {
  commentCount?: number;
  viewCount?: number;
}

/**
 * Calculate a recency score based on how recent the article is
 * Newer articles get higher scores
 */
export function calculateRecencyScore(publishedAt: string): number {
  const now = new Date();
  const publishDate = new Date(publishedAt);
  const hoursDiff = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60);
  
  // Articles published in the last 24 hours get maximum score
  if (hoursDiff < 24) return 1.0;
  
  // Exponential decay over 7 days
  const daysDiff = hoursDiff / 24;
  if (daysDiff < 7) return Math.exp(-daysDiff / 7);
  
  // After 7 days, linear decay
  return Math.max(0.1, 1 - (daysDiff - 7) / 30);
}

/**
 * Calculate engagement score based on views and comments
 */
export function calculateEngagementScore(
  viewCount: number = 0,
  commentCount: number = 0
): number {
  // Normalize views (assuming 1000 views is high)
  const viewScore = Math.min(viewCount / 1000, 1.0);
  
  // Normalize comments (assuming 50 comments is high)
  const commentScore = Math.min(commentCount / 50, 1.0);
  
  // Weight comments more heavily than views
  return (viewScore * 0.4) + (commentScore * 0.6);
}

/**
 * Calculate overall article score combining recency and engagement
 * For search results, relevance should be the primary factor
 */
export function calculateArticleScore(
  article: ArticleWithEngagement,
  options: {
    relevanceScore?: number; // 0-1, from search similarity
    prioritizeRecency?: boolean; // true for category pages
  } = {}
): number {
  const recencyScore = calculateRecencyScore(article.publishedAt);
  const engagementScore = calculateEngagementScore(
    article.viewCount,
    article.commentCount
  );
  
  if (options.relevanceScore !== undefined) {
    // Search results: relevance > engagement > recency
    return (
      options.relevanceScore * 0.5 +
      engagementScore * 0.3 +
      recencyScore * 0.2
    );
  }
  
  if (options.prioritizeRecency) {
    // Category pages: recency > engagement
    return recencyScore * 0.7 + engagementScore * 0.3;
  }
  
  // Default: balanced
  return (recencyScore + engagementScore) / 2;
}

/**
 * Sort articles by their calculated score
 */
export function sortArticlesByScore(
  articles: ArticleWithEngagement[],
  options: {
    relevanceScores?: Map<string, number>;
    prioritizeRecency?: boolean;
  } = {}
): ArticleWithEngagement[] {
  return [...articles].sort((a, b) => {
    const scoreA = calculateArticleScore(a, {
      relevanceScore: options.relevanceScores?.get(a.id),
      prioritizeRecency: options.prioritizeRecency,
    });
    const scoreB = calculateArticleScore(b, {
      relevanceScore: options.relevanceScores?.get(b.id),
      prioritizeRecency: options.prioritizeRecency,
    });
    
    return scoreB - scoreA;
  });
}
