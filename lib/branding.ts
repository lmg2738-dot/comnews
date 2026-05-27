/** 앱 표시명·새로고침 API (단일 출처) */

export const APP_NAME = "커뮤니케이션채널 뉴스";
export const APP_NAME_SHORT = "CC";
export const APP_TAGLINE = "Communication Channel News";

/** 새로고침·자동 수집 시 호출 (Vercel 프로덕션) */
export const REFRESH_RUN_URL =
  "https://comnews.vercel.app/api/status?run=1";

export const LOCAL_STORAGE_AUTO_KEY = "comnews-last-auto-run";
