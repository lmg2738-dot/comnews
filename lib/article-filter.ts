import { articleBelongsToThisInstance } from "./redis-instance";
import type { StoredArticle } from "./news";

function nonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** null·빈 문자열·형식 오류 기사 제외 */
export function isValidStoredArticle(art: unknown): art is StoredArticle {
  if (!art || typeof art !== "object") return false;
  const a = art as Record<string, unknown>;
  if (!nonEmptyString(a.title)) return false;
  if (!nonEmptyString(a.link)) return false;
  if (!nonEmptyString(a.hash)) return false;
  if (!nonEmptyString(a.addedAt)) return false;
  if (!nonEmptyString(a.day) || !/^\d{4}-\d{2}-\d{2}$/.test(a.day)) return false;
  const source = a.source;
  if (source != null && source !== "" && typeof source !== "string") return false;
  return true;
}

/** 이 프로젝트 인스턴스 + 유효 필드만 */
export function filterArticlesForThisInstance(
  articles: unknown[]
): StoredArticle[] {
  return articles
    .filter(isValidStoredArticle)
    .filter(articleBelongsToThisInstance)
    .map((a) => ({
      title: a.title.trim(),
      link: a.link.trim(),
      source: (a.source ?? "").trim() || "뉴스",
      hash: a.hash.trim(),
      addedAt: a.addedAt.trim(),
      day: a.day.trim(),
      instanceId: a.instanceId,
    }));
}
