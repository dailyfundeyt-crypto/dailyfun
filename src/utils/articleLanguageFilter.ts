import { Article } from '@/data/articles';

/**
 * Checks if an article has content available in a specific language
 */
export const hasLanguageContent = (article: Article, languageCode: string): boolean => {
  if (languageCode === 'de') {
    // German content is in the base fields (title, content, excerpt)
    return !!(article.title && article.content && article.excerpt);
  }
  
  if (languageCode === 'en') {
    // English content is in the *En fields
    return !!(article.titleEn && article.contentEn && article.excerptEn);
  }
  
  // For other languages, we don't have content yet
  return false;
};

/**
 * Filters articles based on enabled languages with priority logic:
 * 1. Show article if available in primary language
 * 2. If not, show if available in any other enabled language
 * 3. If none match, don't show the article
 * 
 * @param articles - Array of articles to filter
 * @param enabledLanguages - Array of language codes that are enabled
 * @param primaryLanguage - The primary language to prioritize
 * @returns Filtered array of articles
 */
export const filterArticlesByLanguage = (
  articles: Article[],
  enabledLanguages: string[],
  primaryLanguage: string
): Article[] => {
  // If no languages are selected, show all articles (default behavior)
  if (enabledLanguages.length === 0) {
    return articles;
  }

  return articles.filter(article => {
    // First, check if article is available in primary language
    if (hasLanguageContent(article, primaryLanguage)) {
      return true;
    }

    // If not in primary language, check other enabled languages
    const availableInOtherLanguages = enabledLanguages.some(lang => 
      lang !== primaryLanguage && hasLanguageContent(article, lang)
    );

    return availableInOtherLanguages;
  });
};

/**
 * Gets the best available language for an article based on priority
 * @param article - The article to check
 * @param enabledLanguages - Array of enabled language codes
 * @param primaryLanguage - The primary language to prioritize
 * @returns The language code to use for display
 */
export const getBestArticleLanguage = (
  article: Article,
  enabledLanguages: string[],
  primaryLanguage: string
): string => {
  // First priority: primary language
  if (hasLanguageContent(article, primaryLanguage)) {
    return primaryLanguage;
  }

  // Second priority: any other enabled language
  for (const lang of enabledLanguages) {
    if (lang !== primaryLanguage && hasLanguageContent(article, lang)) {
      return lang;
    }
  }

  // Fallback to primary language (shouldn't happen if filtering is used correctly)
  return primaryLanguage;
};
