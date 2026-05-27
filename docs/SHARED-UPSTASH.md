# 같은 Upstash Redis를 여러 프로젝트에서 쓰기

여러 Vercel/GitHub 프로젝트가 **동일한** `UPSTASH_REDIS_REST_URL` · `UPSTASH_REDIS_REST_TOKEN`을 써도, Redis **키**와 JSON **`instanceId`** 로 데이터가 섞이지 않습니다.

---

## 구분 방식 (2단계)

### 1) Redis 키 분리 (메인)

| `REDIS_INSTANCE_ID` | Redis 키 | 용도 |
|---------------------|----------|------|
| `cj` | `cj-news:state` | CJ 원본 프로젝트 — 기존 데이터 그대로 |
| `com` (**이 프로젝트 기본**) | `com-news:state` | comnews (COMNEW) |
| `lotte` | `lotte-news:state` | 복사한 다른 프로젝트 예시 |
| `samsung` | `samsung-news:state` | 예시 |

`UPSTASH_REDIS_REST_URL` / `TOKEN` 은 같아도 됩니다. **키만 다르면** 기사·sent 이력이 섞이지 않습니다.

### 2) JSON 안 `instanceId` (안전장치)

저장 시 `"instanceId": "com"` 등이 포함됩니다.

다른 프로젝트가 **같은 키**를 잘못 써도, `instanceId`가 다르면 읽지 않고 **빈 상태**로 시작합니다.

- `instanceId` 없는 레거시 데이터: **`cj` 인스턴스만** 호환 (CJ 원본용)

---

## 이 프로젝트 (comnews / COMNEW)

| 항목 | 값 |
|------|-----|
| 기본 `REDIS_INSTANCE_ID` | `com` (안 넣어도 됨) |
| Redis 키 | `com-news:state` |
| 확인 | `/api/status` → `redisInstanceId`, `redisStateKey` |

Vercel에 Upstash URL/TOKEN만 있으면 **재배포** 후 확인:

```json
{
  "redisInstanceId": "com",
  "redisStateKey": "com-news:state"
}
```

### Vercel / GitHub Actions 환경 변수 예시

```env
# CJ 원본과 동일 Upstash
UPSTASH_REDIS_REST_URL=...동일...
UPSTASH_REDIS_REST_TOKEN=...동일...

# 이 프로젝트 전용 (기본 com — 생략 가능)
REDIS_INSTANCE_ID=com

# 뉴스·알림은 프로젝트마다 다르게
NEWS_KEYWORDS=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

→ `com-news:state` 에만 이 프로젝트 기사가 저장됩니다.

---

## 다른 프로젝트 (복사본) 예시

```env
REDIS_INSTANCE_ID=lotte
NEWS_KEYWORDS=롯데,롯데그룹
TELEGRAM_BOT_TOKEN=...다른봇...
TELEGRAM_CHAT_ID=...다른채팅...
UPSTASH_REDIS_REST_URL=...동일...
UPSTASH_REDIS_REST_TOKEN=...동일...
```

→ `lotte-news:state` 에만 롯데 기사 저장.

---

## 고급: 키 직접 지정

```env
REDIS_STATE_KEY=my-own-key
```

`REDIS_INSTANCE_ID` 보다 **우선**합니다.

---

## 로컬 진단

```bash
npm run diagnose
# Redis 직접 조회는 scripts/check-status.ts (getRedisStateKey 사용)
```

자세한 Vercel 변수 목록: [VERCEL-ENV.md](./VERCEL-ENV.md)
