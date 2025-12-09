-- ============================================
-- Storage 버킷 생성: posts (게시물 이미지용)
-- ============================================
-- 공개 읽기 버킷으로 생성하여 게시물 이미지를 공개적으로 접근 가능하게 함
-- PRD.md 요구사항: 게시물 이미지는 공개적으로 접근 가능해야 함
-- ============================================

-- 1. posts 버킷 생성 (공개 읽기)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,  -- public bucket (공개 읽기)
  5242880,  -- 5MB 제한 (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

-- ============================================
-- Storage 정책 설정
-- ============================================

-- INSERT: 인증된 사용자만 자신의 폴더에 업로드 가능
-- 파일 경로 형식: {clerk_user_id}/{filename}
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);

-- SELECT: 공개 버킷이므로 별도 정책 불필요 (모든 사용자가 읽기 가능)
-- Public bucket이므로 자동으로 공개 읽기가 가능합니다.

-- DELETE: 본인 파일만 삭제 가능
CREATE POLICY "Users can delete own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);

-- UPDATE: 본인 파일만 업데이트 가능
CREATE POLICY "Users can update own posts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
)
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);

