/**
 * @deprecated 이 파일은 레거시입니다.
 * 
 * 대신 다음을 사용하세요:
 * - Server Component: `import { createClient } from '@/lib/supabase/server-browser'`
 * - Client Component: `import { createClient } from '@/lib/supabase/browser'`
 * - Clerk 통합 (Server): `import { createClerkSupabaseClient } from '@/lib/supabase/server'`
 * - Clerk 통합 (Client): `import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client'`
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
