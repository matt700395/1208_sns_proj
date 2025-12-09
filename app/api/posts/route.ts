/**
 * @file app/api/posts/route.ts
 * @description 게시물 목록 조회 API
 *
 * GET 요청으로 게시물 목록을 페이지네이션하여 반환합니다.
 * - 쿼리 파라미터: page (기본값: 1), limit (기본값: 10), userId (선택)
 * - post_stats 뷰를 활용하여 좋아요 수, 댓글 수 포함
 * - 현재 사용자의 좋아요 여부 확인 (is_liked)
 *
 * @see supabase/migrations/db.sql - post_stats 뷰
 * @see lib/types.ts - PostWithUser, PaginatedResponse 타입
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import type { PostWithUser, PaginatedResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const userId = searchParams.get("userId"); // 프로필 페이지용

    const offset = (page - 1) * limit;

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 현재 사용자 ID 확인 (좋아요 여부 확인용)
    const { userId: currentUserId } = await auth();
    let currentUserDbId: string | null = null;

    if (currentUserId) {
      // Clerk ID로 Supabase users 테이블에서 사용자 ID 조회
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", currentUserId)
        .single();

      if (userData) {
        currentUserDbId = userData.id;
      }
    }

    // posts 테이블에서 게시물 조회 (users와 JOIN)
    let query = supabase
      .from("posts")
      .select(
        `
        id,
        user_id,
        image_url,
        caption,
        created_at,
        updated_at,
        users (
          id,
          clerk_id,
          name,
          created_at
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // userId가 제공된 경우 필터링 (프로필 페이지용)
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: postsData, error, count } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json(
        { error: "게시물을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!postsData || postsData.length === 0) {
      const response: PaginatedResponse<PostWithUser> = {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          has_more: false,
        },
      };
      return NextResponse.json(response);
    }

    // post_stats 뷰에서 좋아요 수, 댓글 수 조회
    const postIds = postsData.map((post) => post.id);

    const { data: statsData } = await supabase
      .from("post_stats")
      .select("post_id, likes_count, comments_count")
      .in("post_id", postIds);

    const statsMap = new Map(
      statsData?.map((stat) => [
        stat.post_id,
        {
          likes_count: stat.likes_count || 0,
          comments_count: stat.comments_count || 0,
        },
      ]) || []
    );

    // 현재 사용자의 좋아요 여부 확인
    let likedPostIds: string[] = [];

    if (currentUserDbId && postIds.length > 0) {
      const { data: likesData } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", currentUserDbId)
        .in("post_id", postIds);

      likedPostIds = likesData?.map((like) => like.post_id) || [];
    }

    // PostWithUser 타입으로 변환
    const posts: PostWithUser[] = postsData.map((post) => {
      const stats = statsMap.get(post.id) || {
        likes_count: 0,
        comments_count: 0,
      };

      return {
        id: post.id,
        user_id: post.user_id,
        image_url: post.image_url,
        caption: post.caption,
        created_at: post.created_at,
        updated_at: post.updated_at,
        user: {
          id: (post.users as any).id,
          clerk_id: (post.users as any).clerk_id,
          name: (post.users as any).name,
          created_at: (post.users as any).created_at,
        },
        likes_count: stats.likes_count,
        comments_count: stats.comments_count,
        is_liked: likedPostIds.includes(post.id),
      };
    });

    // 페이지네이션 메타데이터
    const total = count || 0;
    const hasMore = offset + limit < total;

    const response: PaginatedResponse<PostWithUser> = {
      data: posts,
      meta: {
        page,
        limit,
        total,
        has_more: hasMore,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in GET /api/posts:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

