"use client";

import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요 (deprecated)
 * - Clerk 네이티브 통합 사용
 * - useAuth().getToken()으로 현재 세션 토큰 사용
 * - React Hook으로 제공되어 Client Component에서 사용
 *
 * 중요: Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 설정해야 합니다.
 * 설정 방법: Supabase Dashboard → Authentication → Providers → Add Provider → Clerk
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { useEffect, useState } from 'react';
 *
 * export default function TasksList() {
 *   const supabase = useClerkSupabaseClient();
 *   const [tasks, setTasks] = useState([]);
 *
 *   useEffect(() => {
 *     async function loadTasks() {
 *       const { data, error } = await supabase
 *         .from('tasks')
 *         .select('*');
 *       if (!error) setTasks(data);
 *     }
 *     loadTasks();
 *   }, [supabase]);
 *
 *   return <div>{tasks.map(task => <div key={task.id}>{task.name}</div>)}</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { getToken, isLoaded } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase URL or Anon Key is missing. Please check your environment variables."
      );
    }

    return createClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        if (!isLoaded) return null;
        const token = await getToken();
        return token ?? null;
      },
    });
  }, [getToken, isLoaded]);

  return supabase;
}
