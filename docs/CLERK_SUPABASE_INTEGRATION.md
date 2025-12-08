# Clerk + Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 네이티브 통합 방식으로 연결하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [사전 준비](#사전-준비)
3. [Supabase 설정](#supabase-설정)
4. [Clerk 설정](#clerk-설정)
5. [코드 구현](#코드-구현)
6. [RLS 정책 설정](#rls-정책-설정)
7. [환경 변수](#환경-변수)
8. [테스트](#테스트)

## 개요

2025년 4월부터 Clerk는 Supabase와의 네이티브 통합을 권장합니다. 이 방식의 장점:

- ✅ JWT 템플릿 불필요 (deprecated)
- ✅ 각 요청마다 새 토큰을 가져올 필요 없음
- ✅ Supabase JWT Secret Key를 Clerk와 공유할 필요 없음
- ✅ 더 간단하고 안전한 통합

## 사전 준비

1. **Clerk 프로젝트 생성**
   - [Clerk Dashboard](https://dashboard.clerk.com/)에서 프로젝트 생성
   - API Keys 확인 (Frontend API URL 필요)

2. **Supabase 프로젝트 생성**
   - [Supabase Dashboard](https://supabase.com/dashboard)에서 프로젝트 생성
   - Project URL과 API Keys 확인

## Supabase 설정

### 1. Clerk를 Third-Party Auth Provider로 추가

1. Supabase Dashboard → **Settings** → **Authentication** → **Providers**
2. 페이지 하단의 **"Third-Party Auth"** 섹션으로 이동
3. **"Add Provider"** 클릭
4. **"Clerk"** 선택
5. Clerk Dashboard에서 복사한 **Clerk Domain** 입력
   - Clerk Dashboard → **Setup** → **Supabase Integration**에서 확인 가능
6. **"Create connection"** 클릭

### 2. RLS (Row Level Security) 활성화

개발 단계에서는 RLS를 비활성화할 수 있지만, 프로덕션에서는 반드시 활성화해야 합니다.

```sql
-- 테이블에 RLS 활성화
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

## Clerk 설정

### 1. Supabase 통합 활성화

1. Clerk Dashboard → **Setup** → **Supabase Integration**
2. **"Activate Supabase integration"** 클릭
3. **Clerk Domain** 복사 (Supabase 설정에서 사용)

## 코드 구현

### Server Component / Server Action

```tsx
// app/page.tsx (Server Component)
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*');
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <div>
      {data?.map(task => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

```ts
// app/actions.ts (Server Action)
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function addTask(name: string) {
  const supabase = createClerkSupabaseClient();
  const { userId } = await auth();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      name,
      user_id: userId, // Clerk user ID
    });
  
  if (error) {
    throw new Error(`Failed to add task: ${error.message}`);
  }
  
  return data;
}
```

### Client Component

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useEffect, useState } from 'react';

export default function TasksList() {
  const supabase = useClerkSupabaseClient();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      
      if (!error && data) {
        setTasks(data);
      }
      setLoading(false);
    }
    
    loadTasks();
  }, [supabase]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

## RLS 정책 설정

Clerk 세션 토큰의 사용자 ID는 `auth.jwt()->>'sub'`로 접근할 수 있습니다.

### 기본 RLS 정책 예시

```sql
-- 예시: tasks 테이블
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "Users can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = user_id);

-- INSERT 정책: 사용자는 자신의 tasks만 생성 가능
CREATE POLICY "Users can insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- UPDATE 정책: 사용자는 자신의 tasks만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'sub' = user_id)
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- DELETE 정책: 사용자는 자신의 tasks만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (auth.jwt()->>'sub' = user_id);
```

### users 테이블 RLS 정책 예시

```sql
-- users 테이블에 RLS 활성화 (프로덕션용)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- SELECT: 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = clerk_id);

-- INSERT: 새 사용자 생성 가능 (동기화용)
CREATE POLICY "Users can insert their own data"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = clerk_id);

-- UPDATE: 사용자는 자신의 정보만 수정 가능
CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'sub' = clerk_id)
WITH CHECK (auth.jwt()->>'sub' = clerk_id);
```

## 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # 서버 전용
```

## 테스트

### 1. 로그인 테스트

1. 애플리케이션 실행: `pnpm dev`
2. Clerk로 로그인
3. 브라우저 개발자 도구 → Network 탭에서 Supabase API 요청 확인
4. Authorization 헤더에 Clerk 토큰이 포함되어 있는지 확인

### 2. 데이터 접근 테스트

```tsx
// 테스트 페이지 예시
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const supabase = useClerkSupabaseClient();
  const { isSignedIn, userId } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSignedIn) return;

    async function testQuery() {
      const { data: result, error: err } = await supabase
        .from('tasks')
        .select('*');
      
      if (err) {
        setError(err.message);
      } else {
        setData(result);
      }
    }

    testQuery();
  }, [isSignedIn, supabase]);

  if (!isSignedIn) {
    return <div>Please sign in to test</div>;
  }

  return (
    <div>
      <h1>Integration Test</h1>
      <p>User ID: {userId}</p>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## 문제 해결

### 문제: "Invalid JWT" 오류

**원인**: Supabase에서 Clerk를 Third-Party Auth Provider로 설정하지 않음

**해결**:
1. Supabase Dashboard → Authentication → Providers 확인
2. Clerk Provider가 추가되어 있는지 확인
3. Clerk Domain이 올바르게 설정되었는지 확인

### 문제: RLS 정책으로 인한 접근 거부

**원인**: RLS 정책이 올바르게 설정되지 않음

**해결**:
1. RLS 정책이 활성화되어 있는지 확인
2. `auth.jwt()->>'sub'`가 올바르게 사용되는지 확인
3. 개발 중에는 RLS를 비활성화하여 테스트

### 문제: 토큰이 전달되지 않음

**원인**: 클라이언트가 로그인하지 않았거나, 토큰 가져오기 실패

**해결**:
1. `useAuth().isSignedIn` 확인
2. `getToken()`이 null을 반환하지 않는지 확인
3. 브라우저 개발자 도구에서 Network 요청 확인

## 참고 자료

- [Clerk Supabase 통합 공식 문서](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/overview)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

