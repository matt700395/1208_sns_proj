/**
 * @file components/post/PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 게시물 목록을 표시하고 무한 스크롤을 구현합니다.
 * - Intersection Observer를 사용한 무한 스크롤
 * - 로딩 상태 관리 (Skeleton UI)
 * - 에러 처리
 * - 빈 상태 처리
 *
 * @see app/api/posts/route.ts - 게시물 조회 API
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import type { PostWithUser, PaginatedResponse } from "@/lib/types";

interface PostFeedProps {
  userId?: string; // 프로필 페이지용 (선택)
}

export default function PostFeed({ userId }: PostFeedProps) {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // 게시물 로드 함수
  const loadPosts = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "10",
        });

        if (userId) {
          params.append("userId", userId);
        }

        const response = await fetch(`/api/posts?${params.toString()}`);

        if (!response.ok) {
          throw new Error("게시물을 불러오는 중 오류가 발생했습니다.");
        }

        const data: PaginatedResponse<PostWithUser> = await response.json();

        if (append) {
          setPosts((prev) => [...prev, ...data.data]);
        } else {
          setPosts(data.data);
        }

        setHasMore(data.meta.has_more);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // 초기 로드
  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  // 무한 스크롤: Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadPosts(nextPage, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page, loadPosts]);

  // 좋아요 토글 핸들러
  // Note: 실제 API 호출은 LikeButton 컴포넌트에서 수행되며,
  // 이 함수는 성공 후 로컬 상태를 업데이트하는 역할만 합니다.
  const handleLikeToggle = async (
    postId: string,
    isLiked: boolean,
    likesCount: number
  ) => {
    // 로컬 상태 업데이트 (LikeButton에서 이미 API 호출 완료)
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: isLiked,
            likes_count: likesCount,
          };
        }
        return post;
      })
    );
  };

  // 에러 상태
  if (error && posts.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 px-4">
        <p className="text-[#8e8e8e] text-sm mb-4">{error}</p>
        <button
          type="button"
          onClick={() => loadPosts(1, false)}
          className="text-sm text-[#0095f6] hover:opacity-70"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 빈 상태
  if (!loading && posts.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 px-4">
        <p className="text-[#8e8e8e] text-sm">게시물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 게시물 목록 */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLikeToggle={handleLikeToggle}
        />
      ))}

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div className="space-y-0">
          {Array.from({ length: 3 }).map((_, index) => (
            <PostCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {/* 무한 스크롤 감지 요소 */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="h-4 w-full" />
      )}

      {/* 더 이상 불러올 데이터가 없을 때 */}
      {!hasMore && posts.length > 0 && (
        <div className="w-full flex items-center justify-center py-8 px-4">
          <p className="text-[#8e8e8e] text-sm">모든 게시물을 불러왔습니다.</p>
        </div>
      )}
    </div>
  );
}


