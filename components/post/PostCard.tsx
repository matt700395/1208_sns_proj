/**
 * @file components/post/PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드를 표시합니다.
 * - 헤더: 프로필 이미지, 사용자명, 시간, 메뉴
 * - 이미지: 1:1 정사각형
 * - 액션 버튼: 좋아요, 댓글, 공유, 북마크
 * - 컨텐츠: 좋아요 수, 캡션, 댓글 미리보기
 *
 * @see docs/PRD.md - PostCard 디자인 (섹션 3)
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import type { PostWithUser, CommentWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import LikeButton from "./LikeButton";

interface PostCardProps {
  post: PostWithUser;
  onLikeToggle?: (postId: string, isLiked: boolean, likesCount: number) => void;
}

export default function PostCard({ post, onLikeToggle }: PostCardProps) {
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [triggerDoubleTap, setTriggerDoubleTap] = useState(false);

  // 캡션 줄 수 계산 (대략적으로)
  const captionLines = post.caption ? post.caption.split("\n").length : 0;
  const shouldTruncate = post.caption && post.caption.length > 100;

  // 댓글 미리보기 로드 (최신 2개)
  useEffect(() => {
    if (post.comments_count > 0) {
      const loadComments = async () => {
        try {
          setLoadingComments(true);
          setCommentsError(null);

          const response = await fetch(
            `/api/comments?postId=${post.id}&limit=2&offset=0`
          );

          if (!response.ok) {
            throw new Error("댓글을 불러오는 중 오류가 발생했습니다.");
          }

          const data: CommentWithUser[] = await response.json();
          setComments(data);
        } catch (err) {
          // 에러 발생 시 무시 (댓글 미리보기는 선택적 기능)
          setCommentsError(
            err instanceof Error ? err.message : "알 수 없는 오류"
          );
          console.error("Error loading comments:", err);
        } finally {
          setLoadingComments(false);
        }
      };

      loadComments();
    }
  }, [post.id, post.comments_count]);

  const handleLikeButtonToggle = (
    postId: string,
    isLiked: boolean,
    newLikesCount: number
  ) => {
    setLikesCount(newLikesCount);
    if (onLikeToggle) {
      onLikeToggle(postId, isLiked, newLikesCount);
    }
  };

  const handleImageDoubleClick = () => {
    // 더블탭 트리거 (이미 좋아요를 누른 경우는 무시)
    if (!post.is_liked) {
      setTriggerDoubleTap((prev) => !prev);
    }
  };

  return (
    <article className="w-full bg-white border-b border-[#dbdbdb]">
      {/* 헤더 (60px) */}
      <header className="flex items-center justify-between px-4 py-3 h-[60px]">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 (32px 원형) */}
          <Link href={`/profile/${post.user.id}`}>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <span className="text-sm font-semibold text-gray-600">
                {post.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </Link>

          {/* 사용자명 및 시간 */}
          <div className="flex flex-col">
            <Link
              href={`/profile/${post.user.id}`}
              className="text-sm font-semibold text-[#262626] hover:opacity-70"
            >
              {post.user.name}
            </Link>
            <span className="text-xs text-[#8e8e8e]">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>
        </div>

        {/* ⋯ 메뉴 버튼 */}
        <button
          type="button"
          className="p-1 hover:opacity-70"
          aria-label="더보기 메뉴"
        >
          <MoreHorizontal className="w-5 h-5 text-[#262626]" />
        </button>
      </header>

      {/* 이미지 영역 (1:1 정사각형) */}
      <div
        className="relative w-full aspect-square bg-gray-100"
        onDoubleClick={handleImageDoubleClick}
      >
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          priority={false}
        />
      </div>

      {/* 액션 버튼 (48px) */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          {/* 좋아요 버튼 */}
          <LikeButton
            postId={post.id}
            initialLiked={post.is_liked || false}
            initialLikesCount={post.likes_count || 0}
            onToggle={handleLikeButtonToggle}
            triggerDoubleTap={triggerDoubleTap}
          />

          {/* 댓글 버튼 */}
          <button
            type="button"
            className="p-0 hover:opacity-70"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6 text-[#262626]" />
          </button>

          {/* 공유 버튼 (UI만) */}
          <button
            type="button"
            className="p-0 hover:opacity-70"
            aria-label="공유"
          >
            <Send className="w-6 h-6 text-[#262626]" />
          </button>
        </div>

        {/* 북마크 버튼 (UI만) */}
        <button
          type="button"
          className="p-0 hover:opacity-70"
          aria-label="북마크"
        >
          <Bookmark className="w-6 h-6 text-[#262626]" />
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <div className="text-sm font-semibold text-[#262626]">
            좋아요 {likesCount.toLocaleString()}개
          </div>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-sm text-[#262626]">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-semibold hover:opacity-70 mr-1"
            >
              {post.user.name}
            </Link>
            <span>
              {showFullCaption || !shouldTruncate
                ? post.caption
                : `${post.caption.slice(0, 100)}...`}
            </span>
            {shouldTruncate && !showFullCaption && (
              <button
                type="button"
                onClick={() => setShowFullCaption(true)}
                className="text-[#8e8e8e] hover:opacity-70 ml-1"
              >
                더 보기
              </button>
            )}
          </div>
        )}

        {/* 댓글 미리보기 */}
        {post.comments_count > 0 && (
          <div className="space-y-1">
            <button
              type="button"
              className="text-sm text-[#8e8e8e] hover:opacity-70"
            >
              댓글 {post.comments_count}개 모두 보기
            </button>

            {/* 최신 2개 댓글 표시 */}
            {loadingComments ? (
              <div className="space-y-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <div key={comment.id} className="text-sm text-[#262626]">
                    <Link
                      href={`/profile/${comment.user.id}`}
                      className="font-semibold hover:opacity-70 mr-1"
                    >
                      {comment.user.name}
                    </Link>
                    <span>{comment.content}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}


