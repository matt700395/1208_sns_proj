"use client";

import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Clerk + Supabase 통합 테스트 페이지
 *
 * 이 페이지는 Clerk와 Supabase 통합이 올바르게 작동하는지 테스트합니다.
 * - Clerk 인증 상태 확인
 * - Supabase 클라이언트를 통한 데이터 접근 테스트
 * - RLS 정책 테스트
 */
export default function IntegrationTestPage() {
  const supabase = useClerkSupabaseClient();
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [taskName, setTaskName] = useState("");

  // Clerk 토큰 가져오기
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      getToken().then(setToken).catch(console.error);
    }
  }, [isSignedIn, isLoaded, getToken]);

  // Tasks 로드
  const loadTasks = async () => {
    if (!isSignedIn) {
      setError("Please sign in first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        setError(`Supabase Error: ${supabaseError.message}`);
      } else {
        setTasks(data || []);
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Task 추가
  const addTask = async () => {
    if (!isSignedIn || !taskName.trim()) {
      setError("Please sign in and enter a task name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("tasks")
        .insert({
          name: taskName.trim(),
          user_id: userId,
        })
        .select()
        .single();

      if (supabaseError) {
        setError(`Supabase Error: ${supabaseError.message}`);
      } else {
        setTaskName("");
        await loadTasks(); // 목록 새로고침
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Integration Test</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Integration Test</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Please sign in to test the Clerk + Supabase integration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Clerk + Supabase Integration Test</h1>

      {/* 인증 정보 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Authentication Status</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Signed In:</span>{" "}
            <span className="text-green-600">Yes</span>
          </p>
          <p>
            <span className="font-medium">User ID:</span> {userId}
          </p>
          <p>
            <span className="font-medium">Token:</span>{" "}
            {token ? (
              <span className="text-green-600">
                {token.substring(0, 20)}... (loaded)
              </span>
            ) : (
              <span className="text-gray-500">Not loaded</span>
            )}
          </p>
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Tasks 관리 */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tasks (RLS Test)</h2>

        {/* Task 추가 폼 */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
            className="flex-1 px-3 py-2 border rounded-md"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTask();
              }
            }}
          />
          <Button onClick={addTask} disabled={loading || !taskName.trim()}>
            Add Task
          </Button>
          <Button onClick={loadTasks} disabled={loading} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Tasks 목록 */}
        {loading && <p className="text-gray-500">Loading...</p>}
        {!loading && tasks.length === 0 && (
          <p className="text-gray-500">No tasks found. Add one above!</p>
        )}
        {!loading && tasks.length > 0 && (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border"
              >
                <div>
                  <p className="font-medium">{task.name}</p>
                  <p className="text-xs text-gray-500">
                    User ID: {task.user_id} | Created:{" "}
                    {new Date(task.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 테스트 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Tasks 테이블이 생성되어 있어야 합니다 (마이그레이션 확인)</li>
          <li>RLS가 활성화된 경우, 자신의 tasks만 조회/생성 가능합니다</li>
          <li>다른 계정으로 로그인하여 RLS 정책이 올바르게 작동하는지 확인</li>
          <li>브라우저 개발자 도구 → Network 탭에서 Supabase 요청 확인</li>
        </ol>
      </div>
    </div>
  );
}

