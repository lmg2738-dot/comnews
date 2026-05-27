/** Upstash Redis 키·instanceId 분리 (docs/SHARED-UPSTASH.md) */

const DEFAULT_INSTANCE_ID = "com";

function sanitizeInstanceId(raw: string): string {
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9-_]/g, "");
  return cleaned || DEFAULT_INSTANCE_ID;
}

/** REDIS_INSTANCE_ID (기본 com → com-news:state) */
export function getRedisInstanceId(): string {
  const raw = process.env.REDIS_INSTANCE_ID?.trim();
  if (!raw) return DEFAULT_INSTANCE_ID;
  return sanitizeInstanceId(raw);
}

/**
 * Redis 상태 키. REDIS_STATE_KEY가 있으면 우선, 없으면 `{instanceId}-news:state`
 */
export function getRedisStateKey(): string {
  const explicit = process.env.REDIS_STATE_KEY?.trim();
  if (explicit) return explicit;
  return `${getRedisInstanceId()}-news:state`;
}

/**
 * Redis에서 읽은 payload의 instanceId 검증.
 * - instanceId가 다르면 무시(빈 상태)
 * - instanceId 없음: cj 인스턴스만 기존 데이터 호환
 */
export function isRedisPayloadForThisInstance(data: {
  instanceId?: string;
}): boolean {
  const expected = getRedisInstanceId();
  if (data.instanceId === undefined) {
    return expected === "cj";
  }
  return data.instanceId === expected;
}

/** 기사 단위 instanceId (없으면 cj 레거시만 허용) */
export function articleBelongsToThisInstance(art: {
  instanceId?: string | null;
}): boolean {
  const expected = getRedisInstanceId();
  const id = art.instanceId;
  if (id === undefined || id === null || String(id).trim() === "") {
    return expected === "cj";
  }
  return sanitizeInstanceId(String(id)) === expected;
}
