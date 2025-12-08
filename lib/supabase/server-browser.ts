import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase 공식 방식의 서버 클라이언트 (공개 데이터용)
 *
 * Supabase 공식 문서의 모범 사례를 따릅니다:
 * - Cookie-based 세션 관리
 * - Next.js 15 App Router 지원
 * - Server Component에서 사용
 *
 * 주의: 이 클라이언트는 Supabase의 기본 Auth를 사용합니다.
 * Clerk 통합이 필요한 경우 `createClerkSupabaseClient`를 사용하세요.
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClient } from '@/lib/supabase/server-browser';
 *
 * export default async function Page() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('instruments').select('*');
 *   return <div>...</div>;
 * }
 * ```
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

