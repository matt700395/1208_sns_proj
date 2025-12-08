# Supabase 설정 가이드

이 문서는 Supabase 공식 문서의 모범 사례를 따라 Next.js 프로젝트에 Supabase를 연결하는 방법을 설명합니다.

## 📋 목차

1. [Supabase 프로젝트 생성](#supabase-프로젝트-생성)
2. [환경 변수 설정](#환경-변수-설정)
3. [클라이언트 사용법](#클라이언트-사용법)
4. [예시 페이지](#예시-페이지)
5. [Clerk 통합과의 차이점](#clerk-통합과의-차이점)

## Supabase 프로젝트 생성

### 1. Supabase 프로젝트 생성

1. [database.new](https://database.new)로 이동하여 새로운 Supabase 프로젝트를 생성합니다.
2. 프로젝트가 준비될 때까지 대기 (~2분)

### 2. 샘플 테이블 생성

Supabase Dashboard → **SQL Editor**에서 다음 SQL을 실행합니다:

```sql
-- instruments 테이블 생성
CREATE TABLE instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- 샘플 데이터 삽입
INSERT INTO instruments (name)
VALUES
  ('violin'),
  ('viola'),
  ('cello');

-- Row Level Security 활성화
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 추가
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);
```

### 3. API 키 확인

Supabase Dashboard → **Settings** → **API**에서 다음 정보를 확인합니다:

- **Project URL**: `https://your-project.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가합니다:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 클라이언트 사용법

프로젝트는 두 가지 방식의 Supabase 클라이언트를 제공합니다:

### 1. Supabase 공식 방식 (공개 데이터용)

Supabase의 기본 Auth를 사용하는 방식입니다.

#### Server Component

```tsx
// app/page.tsx
import { createClient } from '@/lib/supabase/server-browser';
import { Suspense } from 'react';

async function DataComponent() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instruments')
    .select('*');
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return <div>{/* 데이터 표시 */}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataComponent />
    </Suspense>
  );
}
```

#### Client Component

```tsx
'use client';

import { createClient } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';

export default function ClientComponent() {
  const supabase = createClient();
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('instruments')
        .select('*');
      
      if (!error && data) {
        setData(data);
      }
    }
    
    fetchData();
  }, [supabase]);

  return <div>{/* 데이터 표시 */}</div>;
}
```

### 2. Clerk 통합 방식 (인증된 사용자 데이터용)

Clerk 인증을 사용하는 경우:

#### Server Component

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createClerkSupabaseClient();
  const { data } = await supabase.from('tasks').select('*');
  return <div>...</div>;
}
```

#### Client Component

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function Component() {
  const supabase = useClerkSupabaseClient();
  // ...
}
```

## 예시 페이지

프로젝트에 `/instruments` 페이지가 포함되어 있습니다. 이 페이지는 Supabase 공식 문서의 모범 사례를 따릅니다:

```bash
# 개발 서버 실행
pnpm dev

# 브라우저에서 확인
http://localhost:3000/instruments
```

## Clerk 통합과의 차이점

### 언제 어떤 클라이언트를 사용해야 할까요?

| 상황 | 사용할 클라이언트 | 파일 경로 |
|------|------------------|----------|
| 공개 데이터 (인증 불필요) | Supabase 공식 방식 | `@/lib/supabase/server-browser` 또는 `@/lib/supabase/browser` |
| Clerk 인증된 사용자 데이터 | Clerk 통합 방식 | `@/lib/supabase/server` 또는 `@/lib/supabase/clerk-client` |
| 관리자 작업 (RLS 우회) | Service Role | `@/lib/supabase/service-role` |

### 주요 차이점

#### Supabase 공식 방식
- ✅ Supabase의 기본 Auth 사용
- ✅ Cookie-based 세션 관리
- ✅ 공개 데이터 접근에 적합
- ✅ Supabase 공식 문서와 일치

#### Clerk 통합 방식
- ✅ Clerk 인증 사용
- ✅ Third-Party Auth Provider 설정 필요
- ✅ RLS 정책에서 `auth.jwt()->>'sub'` 사용
- ✅ Clerk 사용자 ID로 데이터 필터링

## 추가 리소스

- [Supabase 공식 문서 - Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase SSR 패키지 문서](https://supabase.com/docs/reference/javascript/ssr)
- [Clerk + Supabase 통합 가이드](./CLERK_SUPABASE_INTEGRATION.md)

