/**
 * @file app/(main)/page.tsx
 * @description Instagram SNS 홈 피드 페이지
 *
 * 이 페이지는 메인 레이아웃(Sidebar, Header, BottomNav) 내부에 표시됩니다.
 * PostFeed 컴포넌트를 통해 게시물 목록을 표시합니다.
 *
 * @see components/post/PostFeed.tsx - 게시물 피드 컴포넌트
 */

import PostFeed from "@/components/post/PostFeed";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-[#fafafa] py-4 md:py-8">
      <div className="w-full max-w-[630px] mx-auto">
        <PostFeed />
      </div>
    </div>
  );
}

