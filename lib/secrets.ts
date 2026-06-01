import { config as loadDotenv } from "dotenv";
import { join } from "path";

let envFilesLoaded = false;

/**
 * 로컬 tsx 배치용 .env 로드.
 * Vercel·GitHub Actions는 플랫폼 env만 사용 (파일이 플랫폼 값을 덮어쓰지 않도록 스킵).
 */
export function ensureEnvFilesLoaded(): void {
  if (envFilesLoaded) return;
  envFilesLoaded = true;
  if (process.env.VERCEL || process.env.GITHUB_ACTIONS === "true") {
    return;
  }
  loadDotenv({ path: join(process.cwd(), ".env.local") });
  loadDotenv({ path: join(process.cwd(), ".env") });
}

export function missingEnvHint(names: string[]): string {
  const where = process.env.VERCEL
    ? "Vercel 대시보드 → Project → Settings → Environment Variables"
    : "로컬 .env.local 또는 GitHub Actions Secrets";
  return `${names.join(", ")} 를 ${where}에 설정하세요.`;
}

ensureEnvFilesLoaded();
