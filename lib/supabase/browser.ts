"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase 공식 방식의 브라우저 클라이언트 (공개 데이터용)
 *
 * Supabase 공식 문서의 모범 사례를 따릅니다:
 * - Cookie-based 세션 관리
 * - Client Component에서 사용
 * - 자동 쿠키 처리
 *
 * 주의: 이 클라이언트는 Supabase의 기본 Auth를 사용합니다.
 * Clerk 통합이 필요한 경우 `useClerkSupabaseClient`를 사용하세요.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { createClient } from '@/lib/supabase/browser';
 *
 * export default function Component() {
 *   const supabase = createClient();
 *   // ...
 * }
 * ```
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

