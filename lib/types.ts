/**
 * @file types.ts
 * @description Instagram SNS 프로젝트의 TypeScript 타입 정의
 *
 * 이 파일은 Supabase 데이터베이스 스키마를 기반으로 한 타입 정의를 포함합니다.
 * 모든 타입은 supabase/migrations/db.sql의 테이블 구조와 일치합니다.
 *
 * @see supabase/migrations/db.sql - 데이터베이스 스키마
 */

// ============================================
// 기본 엔티티 타입
// ============================================

/**
 * 사용자 정보
 * @see supabase/migrations/db.sql - users 테이블
 */
export interface User {
  id: string; // UUID
  clerk_id: string; // Clerk 사용자 ID (UNIQUE)
  name: string;
  created_at: string; // ISO timestamp
}

/**
 * 게시물
 * @see supabase/migrations/db.sql - posts 테이블
 */
export interface Post {
  id: string; // UUID
  user_id: string; // UUID (users.id 참조)
  image_url: string; // Supabase Storage URL
  caption: string | null; // 최대 2,200자
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * 좋아요
 * @see supabase/migrations/db.sql - likes 테이블
 */
export interface Like {
  id: string; // UUID
  post_id: string; // UUID (posts.id 참조)
  user_id: string; // UUID (users.id 참조)
  created_at: string; // ISO timestamp
}

/**
 * 댓글
 * @see supabase/migrations/db.sql - comments 테이블
 */
export interface Comment {
  id: string; // UUID
  post_id: string; // UUID (posts.id 참조)
  user_id: string; // UUID (users.id 참조)
  content: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * 팔로우
 * @see supabase/migrations/db.sql - follows 테이블
 */
export interface Follow {
  id: string; // UUID
  follower_id: string; // UUID (users.id 참조) - 팔로우하는 사람
  following_id: string; // UUID (users.id 참조) - 팔로우받는 사람
  created_at: string; // ISO timestamp
}

// ============================================
// View 타입 (통계)
// ============================================

/**
 * 게시물 통계 뷰
 * @see supabase/migrations/db.sql - post_stats 뷰
 */
export interface PostStats {
  post_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

/**
 * 사용자 통계 뷰
 * @see supabase/migrations/db.sql - user_stats 뷰
 */
export interface UserStats {
  user_id: string;
  clerk_id: string;
  name: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
}

// ============================================
// 확장 타입 (관계 포함)
// ============================================

/**
 * 사용자 정보와 함께 포함된 게시물
 * API 응답에서 자주 사용되는 타입
 */
export interface PostWithUser extends Post {
  user: User;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean; // 현재 사용자가 좋아요 했는지
}

/**
 * 사용자 정보와 함께 포함된 댓글
 * API 응답에서 자주 사용되는 타입
 */
export interface CommentWithUser extends Comment {
  user: User;
}

/**
 * 팔로우 관계와 함께 포함된 사용자 정보
 */
export interface UserWithFollow extends User {
  is_following?: boolean; // 현재 사용자가 이 사용자를 팔로우 중인지
  is_followed_by?: boolean; // 이 사용자가 현재 사용자를 팔로우 중인지
}

// ============================================
// API 응답 타입
// ============================================

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

/**
 * 페이지네이션된 응답
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// 폼 데이터 타입
// ============================================

/**
 * 게시물 생성 폼 데이터
 */
export interface CreatePostData {
  image: File;
  caption: string;
}

/**
 * 댓글 작성 폼 데이터
 */
export interface CreateCommentData {
  post_id: string;
  content: string;
}

