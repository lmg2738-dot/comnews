import { getNewsKeywords } from "./config";
import type { StoredArticle } from "./news";

/** 현재 환경 변수 NEWS_KEYWORDS 집합 */
export function getActiveKeywordSet(keywords?: string[]): Set<string> {
  const list = keywords ?? getNewsKeywords();
  return new Set(list.map((k) => k.trim()).filter(Boolean));
}

/** 저장·표시: 현재 활성 키워드로 수집된 기사만 */
export function articleMatchesActiveKeywords(
  art: { keyword?: string },
  active?: Set<string>
): boolean {
  const set = active ?? getActiveKeywordSet();
  const kw = art.keyword?.trim();
  if (!kw || set.size === 0) return false;
  return set.has(kw);
}

export function filterArticlesByActiveKeywords<T extends { keyword?: string }>(
  articles: T[],
  keywords?: string[]
): T[] {
  const active = getActiveKeywordSet(keywords);
  if (active.size === 0) return [];
  return articles.filter((a) => articleMatchesActiveKeywords(a, active));
}

export function countByKeyword(
  articles: StoredArticle[],
  keywords?: string[]
): Record<string, number> {
  const active = getActiveKeywordSet(keywords);
  const counts: Record<string, number> = {};
  for (const k of active) counts[k] = 0;
  for (const a of articles) {
    const kw = a.keyword?.trim();
    if (kw && active.has(kw)) counts[kw] = (counts[kw] ?? 0) + 1;
  }
  return counts;
}
