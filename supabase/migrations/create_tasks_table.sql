-- Tasks 테이블 생성
-- Clerk + Supabase 통합 테스트를 위한 예시 테이블
-- RLS 정책이 올바르게 작동하는지 테스트하기 위해 사용

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL, -- Clerk user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.tasks OWNER TO postgres;

-- Row Level Security (RLS) 비활성화 (개발용)
-- 프로덕션에서는 아래 주석을 해제하고 RLS를 활성화하세요
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.tasks TO anon;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- 프로덕션용 RLS 정책 (주석 처리됨 - 필요시 활성화)
-- 아래 주석을 해제하고 위의 DISABLE ROW LEVEL SECURITY를 제거하세요

/*
-- RLS 활성화
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "Users can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = user_id);

-- INSERT 정책: 사용자는 자신의 tasks만 생성 가능
CREATE POLICY "Users can insert their own tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- UPDATE 정책: 사용자는 자신의 tasks만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'sub' = user_id)
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- DELETE 정책: 사용자는 자신의 tasks만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (auth.jwt()->>'sub' = user_id);
*/

