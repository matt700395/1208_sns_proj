/**
 * @file app/api/comments/route.ts
 * @description 댓글 조회 API
 *
 * GET 요청으로 특정 게시물의 댓글 목록을 조회합니다.
 * - 쿼리 파라미터: postId (필수), limit (기본값: 2, 미리보기용), offset (기본값: 0)
 * - 사용자 정보와 함께 포함된 댓글 반환 (CommentWithUser)
 * - 정렬: created_at DESC (최신순)
 *
 * @see supabase/migrations/db.sql - comments 테이블
 * @see lib/types.ts - CommentWithUser 타입
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { CommentWithUser } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");
    const limit = parseInt(searchParams.get("limit") || "2", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // postId 필수 검증
    if (!postId) {
      return NextResponse.json(
        { error: "postId 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // comments 테이블에서 댓글 조회 (users와 JOIN)
    const { data: commentsData, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        post_id,
        user_id,
        content,
        created_at,
        updated_at,
        users (
          id,
          clerk_id,
          name,
          created_at
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "댓글을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!commentsData || commentsData.length === 0) {
      return NextResponse.json([]);
    }

    // CommentWithUser 타입으로 변환
    const comments: CommentWithUser[] = commentsData.map((comment) => ({
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: {
        id: (comment.users as any).id,
        clerk_id: (comment.users as any).clerk_id,
        name: (comment.users as any).name,
        created_at: (comment.users as any).created_at,
      },
    }));

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Unexpected error in GET /api/comments:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

