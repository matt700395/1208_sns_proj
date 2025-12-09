/**
 * @file components/post/LikeButton.tsx
 * @description 좋아요 버튼 컴포넌트
 *
 * Instagram 스타일의 좋아요 버튼을 구현합니다.
 * - 빈 하트 ↔ 빨간 하트 상태 관리
 * - 클릭 애니메이션 (scale 1.3 → 1, 0.15초)
 * - 더블탭 좋아요 (큰 하트 fade in/out, 1초)
 * - API 호출 및 에러 처리
 *
 * @see docs/PRD.md - 좋아요 기능 (섹션 7.3)
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  onToggle?: (postId: string, isLiked: boolean, likesCount: number) => void;
  triggerDoubleTap?: boolean; // 더블탭 트리거 (PostCard에서 제어)
}

export default function LikeButton({
  postId,
  initialLiked,
  initialLikesCount,
  onToggle,
  triggerDoubleTap = false,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 초기값이 변경되면 상태 업데이트 (외부에서 props 변경 시)
  useEffect(() => {
    setIsLiked(initialLiked);
    setLikesCount(initialLikesCount);
  }, [initialLiked, initialLikesCount]);

  // 더블탭 트리거 처리
  useEffect(() => {
    if (triggerDoubleTap && !isLiked && !isLoading) {
      // 더블탭으로 좋아요 추가
      handleLikeToggle(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerDoubleTap]);

  // 더블탭 큰 하트 애니메이션
  useEffect(() => {
    if (showDoubleTapHeart) {
      // 1초 후 fade out
      doubleTapTimeoutRef.current = setTimeout(() => {
        setShowDoubleTapHeart(false);
      }, 1000);

      return () => {
        if (doubleTapTimeoutRef.current) {
          clearTimeout(doubleTapTimeoutRef.current);
        }
      };
    }
  }, [showDoubleTapHeart]);

  const handleLikeToggle = async (fromDoubleTap = false) => {
    // 중복 클릭 방지
    if (isLoading) return;

    const newLikedState = !isLiked;
    const newLikesCount = newLikedState
      ? likesCount + 1
      : Math.max(0, likesCount - 1);

    // 낙관적 업데이트 (Optimistic Update)
    setIsLiked(newLikedState);
    setLikesCount(newLikesCount);

    // 더블탭인 경우 큰 하트 표시
    if (fromDoubleTap && newLikedState) {
      setShowDoubleTapHeart(true);
    }

    try {
      setIsLoading(true);

      const method = newLikedState ? "POST" : "DELETE";
      const response = await fetch("/api/likes", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "좋아요 처리 중 오류가 발생했습니다.");
      }

      // 성공 시 콜백 호출
      if (onToggle) {
        onToggle(postId, newLikedState, newLikesCount);
      }
    } catch (error) {
      // 실패 시 롤백
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      setShowDoubleTapHeart(false);

      console.error("Error toggling like:", error);
      // 사용자에게 에러 알림 (선택적)
      // alert(error instanceof Error ? error.message : "좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    handleLikeToggle(false);
  };

  return (
    <div className="relative">
      {/* 더블탭 큰 하트 (fade in/out) */}
      {showDoubleTapHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <Heart className="w-24 h-24 fill-[#ed4956] text-[#ed4956] animate-fade-in-out" />
        </div>
      )}

      {/* 좋아요 버튼 */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "p-0 hover:opacity-70 transition-transform",
          "active:scale-[1.3]",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        style={{
          transitionDuration: "0.15s",
        }}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        <Heart
          className={cn(
            "w-6 h-6 transition-all",
            isLiked
              ? "fill-[#ed4956] text-[#ed4956]"
              : "text-[#262626]"
          )}
        />
      </button>
    </div>
  );
}

