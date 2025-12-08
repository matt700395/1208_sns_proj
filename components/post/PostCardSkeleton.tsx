/**
 * @file components/post/PostCardSkeleton.tsx
 * @description 게시물 카드 로딩 UI (Skeleton)
 *
 * PostCard와 동일한 레이아웃 구조를 가진 스켈레톤 UI입니다.
 * Shimmer 애니메이션 효과를 포함합니다.
 *
 * @see components/post/PostCard.tsx - 실제 PostCard 컴포넌트
 */

export default function PostCardSkeleton() {
  return (
    <div className="w-full bg-white border-b border-[#dbdbdb] animate-pulse">
      {/* 헤더 영역 (60px) */}
      <div className="flex items-center gap-3 px-4 py-3 h-[60px]">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>

      {/* 이미지 영역 (1:1 정사각형) */}
      <div className="w-full aspect-square bg-gray-200" />

      {/* 액션 버튼 영역 (48px) */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="w-6 h-6 bg-gray-200 rounded" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-4 pb-4 space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="space-y-1">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>
        <div className="h-3 w-32 bg-gray-200 rounded mt-2" />
        <div className="space-y-1 mt-2">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-2/3 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

