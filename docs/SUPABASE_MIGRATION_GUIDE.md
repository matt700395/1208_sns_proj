# Supabase 마이그레이션 및 Storage 설정 가이드

이 문서는 Instagram SNS 프로젝트의 Supabase 데이터베이스 마이그레이션과 Storage 버킷 설정 방법을 설명합니다.

## 목차

1. [데이터베이스 마이그레이션 적용](#데이터베이스-마이그레이션-적용)
2. [테이블 및 뷰 확인](#테이블-및-뷰-확인)
3. [Storage 버킷 생성](#storage-버킷-생성)
4. [Storage 정책 설정](#storage-정책-설정)

## 데이터베이스 마이그레이션 적용

### 방법 1: Supabase Dashboard 사용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/db.sql` 파일의 전체 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
7. 성공 메시지 확인

### 방법 2: Supabase CLI 사용 (로컬 개발)

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 적용
supabase db push
```

## 테이블 및 뷰 확인

### 테이블 확인

Supabase Dashboard → **Table Editor**에서 다음 테이블들이 생성되었는지 확인:

- ✅ `users` - 사용자 정보
- ✅ `posts` - 게시물
- ✅ `likes` - 좋아요
- ✅ `comments` - 댓글
- ✅ `follows` - 팔로우

각 테이블의 컬럼과 인덱스가 올바르게 생성되었는지 확인하세요.

### 뷰 확인

Supabase Dashboard → **Database** → **Views**에서 다음 뷰가 생성되었는지 확인:

- ✅ `post_stats` - 게시물 통계 (좋아요 수, 댓글 수)
- ✅ `user_stats` - 사용자 통계 (게시물 수, 팔로워 수, 팔로잉 수)

### 트리거 확인

Supabase Dashboard → **Database** → **Triggers**에서 다음 트리거가 생성되었는지 확인:

- ✅ `set_updated_at` on `posts` - updated_at 자동 업데이트
- ✅ `set_updated_at` on `comments` - updated_at 자동 업데이트

또는 SQL Editor에서 다음 쿼리로 확인:

```sql
-- 트리거 확인
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

## Storage 버킷 생성

### 1. 버킷 생성

1. Supabase Dashboard → **Storage** 메뉴
2. **New bucket** 버튼 클릭
3. 다음 정보 입력:
   - **Name**: `posts`
   - **Public bucket**: ✅ 체크 (공개 읽기)
   - **File size limit**: `5242880` (5MB, 바이트 단위)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp` (선택사항)
4. **Create bucket** 클릭

### 2. 버킷 설정 확인

생성된 `posts` 버킷에서:
- Public bucket이 활성화되어 있는지 확인
- File size limit이 5MB로 설정되어 있는지 확인

## Storage 정책 설정

### 개발 단계 (RLS 비활성화)

개발 단계에서는 RLS가 비활성화되어 있으므로, Storage 정책도 간단하게 설정할 수 있습니다.

Supabase Dashboard → **Storage** → **Policies**에서 `posts` 버킷의 정책을 설정합니다.

#### INSERT 정책 (업로드)

```sql
-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');
```

#### SELECT 정책 (읽기)

Public bucket이므로 자동으로 공개 읽기가 가능합니다. 별도 정책이 필요 없습니다.

#### DELETE 정책 (삭제)

```sql
-- 본인 파일만 삭제 가능
-- 파일 경로 형식: {clerk_user_id}/{filename}
CREATE POLICY "Users can delete own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' 
  AND (storage.foldername(name))[1] = auth.jwt()->>'sub'
);
```

### 정책 적용 방법

1. Supabase Dashboard → **Storage** → **Policies**
2. `posts` 버킷 선택
3. **New Policy** 클릭
4. 위의 SQL을 복사하여 붙여넣기
5. **Review** → **Save policy** 클릭

## 마이그레이션 검증

### SQL 쿼리로 확인

SQL Editor에서 다음 쿼리를 실행하여 모든 테이블이 올바르게 생성되었는지 확인:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 예상 결과:
-- comments
-- follows
-- likes
-- posts
-- users
```

```sql
-- 뷰 목록 확인
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 예상 결과:
-- post_stats
-- user_stats
```

```sql
-- 인덱스 확인
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 문제 해결

### 문제: "relation already exists" 오류

**원인**: 테이블이 이미 존재함

**해결**: 
- `CREATE TABLE IF NOT EXISTS` 구문을 사용했으므로 안전하게 재실행 가능
- 또는 기존 테이블을 삭제 후 재생성

### 문제: "permission denied" 오류

**원인**: 권한 부여가 제대로 되지 않음

**해결**: 
- `GRANT ALL ON TABLE ...` 구문이 실행되었는지 확인
- Supabase Dashboard에서 테이블 권한 확인

### 문제: Storage 업로드 실패

**원인**: Storage 정책이 설정되지 않음

**해결**: 
- Storage 정책이 올바르게 설정되었는지 확인
- Public bucket이 활성화되어 있는지 확인

## 다음 단계

마이그레이션이 완료되면:

1. ✅ 테이블 생성 확인
2. ✅ 뷰 및 트리거 확인
3. ✅ Storage 버킷 생성
4. ✅ Storage 정책 설정
5. 다음 단계: 레이아웃 구조 구현 (TODO.md 섹션 2)

## 참고 파일

- [supabase/migrations/db.sql](../supabase/migrations/db.sql) - 데이터베이스 스키마
- [docs/PRD.md](./PRD.md) - 프로젝트 요구사항
- [docs/TODO.md](./TODO.md) - 개발 TODO 리스트

