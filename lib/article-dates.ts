import { subDays } from "date-fns";
import {
  dayKeyKST,
  nowKST,
  RECENT_NEWS_DAYS,
  RECENT_NEWS_HOURS,
  recentDayKeys,
  yesterdayKST,
} from "./dates";

/** RSS pubDate 등 → Date (실패 시 null) */
export function parsePublishedToDate(published?: string): Date | null {
  const raw = published?.trim();
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 기사 게시일 (KST yyyy-MM-dd) */
export function articleDayFromPublished(published?: string): string | null {
  const d = parsePublishedToDate(published);
  return d ? dayKeyKST(d) : null;
}

/** 최근 RECENT_NEWS_DAYS 일(KST)에 해당하는 day만 허용 */
export function isRecentNewsDay(day: string): boolean {
  return recentDayKeys().has(day);
}

/** pubDate 기준 RECENT_NEWS_HOURS(48h) 이내 */
export function isPublishedWithinRecency(published?: string): boolean {
  const d = parsePublishedToDate(published);
  if (!d) return false;
  const ageMs = Date.now() - d.getTime();
  if (ageMs < -60 * 60 * 1000) return false;
  return ageMs <= RECENT_NEWS_HOURS * 60 * 60 * 1000;
}

/** day(KST) + 게시 시각(48h) 모두 만족 */
export function passesRecencyFilter(art: { published?: string }): boolean {
  const pubDay = articleDayFromPublished(art.published);
  if (!pubDay || !isRecentNewsDay(pubDay)) return false;
  return isPublishedWithinRecency(art.published);
}

/**
 * 네이버 검색 목록의 시간 문자열 → KST day
 * 예: "3시간 전", "어제", "2025.05.27."
 */
export function naverTimeLabelToDayKST(
  label: string,
  ref: Date = nowKST()
): string | null {
  const t = label.trim();
  if (!t) return null;

  if (/^(?:\d+\s*분\s*전|\d+\s*시간\s*전|방금|조금\s*전)$/u.test(t)) {
    return dayKeyKST(ref);
  }
  if (t === "어제") {
    return yesterdayKST();
  }

  const daysAgo = t.match(/^(\d+)\s*일\s*전$/);
  if (daysAgo) {
    const n = Number(daysAgo[1]);
    if (n >= 1 && n < RECENT_NEWS_DAYS) {
      return dayKeyKST(subDays(ref, n));
    }
    return null;
  }

  const abs = t.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})\.?$/);
  if (abs) {
    const [, y, m, d] = abs;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // "N일 전" 등은 당일·어제 밖 → 제외
  return null;
}

/** 저장·표시용 day 결정 (published 우선) */
export function resolveArticleDayKST(art: {
  published?: string;
}): string | null {
  return articleDayFromPublished(art.published);
}

/**
 * 레거시 오염 데이터: day=오늘인데 1년 전 수집된 기사 등 제외
 */
export function isTrustworthyForDisplay(art: {
  day: string;
  addedAt: string;
  published?: string;
}): boolean {
  if (!isRecentNewsDay(art.day)) return false;

  if (art.published) {
    const pubDay = articleDayFromPublished(art.published);
    return pubDay === art.day && passesRecencyFilter(art);
  }

  // published 없음(구 데이터): 수집 시각이 RECENT_NEWS_HOURS 이내만 허용
  const added = new Date(art.addedAt).getTime();
  if (Number.isNaN(added)) return false;
  return Date.now() - added < RECENT_NEWS_HOURS * 60 * 60 * 1000;
}

/** Google News RSS: 최근 2일만 검색 */
export function googleNewsQuery(keyword: string): string {
  return `${keyword.trim()} when:2d`;
}
