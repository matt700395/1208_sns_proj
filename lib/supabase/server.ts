import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component/Server Action용)
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요 (deprecated)
 * - Clerk 네이티브 통합 사용
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 *
 * 중요: Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 설정해야 합니다.
 * 설정 방법: Supabase Dashboard → Authentication → Providers → Add Provider → Clerk
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = createClerkSupabaseClient();
 *   const { data, error } = await supabase.from('tasks').select('*');
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```ts
 * // Server Action
 * 'use server';
 *
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export async function addTask(name: string) {
 *   const supabase = createClerkSupabaseClient();
 *   const { data, error } = await supabase
 *     .from('tasks')
 *     .insert({ name, user_id: (await auth()).userId });
 * }
 * ```
 */
export function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL or Anon Key is missing. Please check your environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      const token = await (await auth()).getToken();
      return token ?? null;
    },
  });
}
