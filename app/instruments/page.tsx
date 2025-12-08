import { createClient } from "@/lib/supabase/server-browser";
import { Suspense } from "react";

/**
 * Supabase 공식 문서 예시 페이지
 * 
 * 이 페이지는 Supabase 공식 문서의 모범 사례를 따릅니다:
 * - Server Component에서 데이터 페칭
 * - Suspense를 사용한 로딩 상태 처리
 * - Supabase 공식 방식의 클라이언트 사용
 * 
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */
async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select("*");

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold">Error:</p>
        <p className="text-red-700 text-sm mt-1">{error.message}</p>
        <p className="text-red-600 text-xs mt-2">
          💡 Make sure the `instruments` table exists in your Supabase database.
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          No instruments found. Please add some data to the `instruments` table.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {instruments.map((instrument: any) => (
        <div
          key={instrument.id}
          className="p-4 bg-white border rounded-lg shadow-sm"
        >
          <p className="font-medium">{instrument.name}</p>
        </div>
      ))}
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Instruments</h1>
      <p className="text-gray-600 mb-6">
        This page demonstrates Supabase integration following the official
        documentation pattern.
      </p>

      <Suspense
        fallback={
          <div className="p-8 text-center text-gray-500">
            Loading instruments...
          </div>
        }
      >
        <InstrumentsData />
      </Suspense>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">💡 How it works:</h3>
        <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
          <li>Uses Supabase official SSR pattern with cookie-based auth</li>
          <li>Server Component fetches data on the server</li>
          <li>Suspense handles loading states</li>
          <li>
            Make sure the `instruments` table exists in your Supabase database
          </li>
        </ul>
      </div>
    </div>
  );
}

