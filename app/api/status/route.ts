import { jsonWithCors, optionsCors } from "@/lib/api-cors";
import { todayKST, yesterdayKST } from "@/lib/dates";
import { collectArticles } from "@/lib/news";
import { getConfig, getKeywordFetchConcurrency, getNewsKeywords } from "@/lib/config";
import { countByKeyword } from "@/lib/keywords";
import { runNewsCycle } from "@/lib/runner";
import { isRedisConfigured } from "@/lib/redis-client";
import {
  canPersistState,
  getActiveStorageBackend,
  getRedisInstanceId,
  getRedisStateKey,
  getStatePublicUrl,
  getVisibleArticles,
  loadState,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return optionsCors();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const run = searchParams.get("run") === "1";

  try {
    const config = getConfig();
    const collected = await collectArticles(config.keywords);
    const state = await loadState();
    const visible = getVisibleArticles(state.articles);

    const storedSentBefore = Object.keys(state.sent).length;

    let runResult = null;
    if (run) {
      runResult = await runNewsCycle();
    }

    const stateAfter = run ? await loadState() : state;

    const activeKeywords = getNewsKeywords();

    return jsonWithCors({
      ok: true,
      newsKeywords: activeKeywords,
      keywordFetchConcurrency: getKeywordFetchConcurrency(),
      keywordNote:
        "검색 키워드는 NEWS_KEYWORDS 환경 변수입니다. KEYWORD_FETCH_CONCURRENCY는 동시 수집 개수만 설정합니다.",
      visibleByKeyword: countByKeyword(
        getVisibleArticles(stateAfter.articles),
        activeKeywords
      ),
      schedule: "github-actions-hourly-kst",
      scheduleDoc: "/docs/SCHEDULE-FREE.md",
      envDoc: "/docs/VERCEL-ENV.md",
      storageBackend: getActiveStorageBackend(),
      redisConfigured: isRedisConfigured(),
      redisInstanceId: getRedisInstanceId(),
      redisStateKey: getRedisStateKey(),
      storageReady: canPersistState(),
      stateUrl: getStatePublicUrl(),
      today: todayKST(),
      yesterday: yesterdayKST(),
      collectedNow: collected.length,
      storedArticles: stateAfter.articles.length,
      storedSent: storedSentBefore,
      storedSentAfter: run ? Object.keys(stateAfter.sent).length : storedSentBefore,
      visibleOnWeb: getVisibleArticles(stateAfter.articles).length,
      sampleCollected: collected.slice(0, 3).map((a) => ({
        title: a.title.slice(0, 60),
        source: a.source,
        hash: a.hash,
      })),
      runResult,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return jsonWithCors({ ok: false, error: message }, { status: 500 });
  }
}
