/**
 * @file app/(main)/page.tsx
 * @description Instagram SNS 홈 피드 페이지
 *
 * 이 페이지는 메인 레이아웃(Sidebar, Header, BottomNav) 내부에 표시됩니다.
 * 현재는 임시 페이지이며, 추후 PostFeed 컴포넌트로 대체됩니다.
 */

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-[#fafafa] py-4 md:py-8">
      <div className="w-full max-w-[630px] mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4 text-[#262626]">홈 피드</h1>
        <p className="text-[#8e8e8e]">
          게시물 목록이 여기에 표시됩니다. (추후 구현 예정)
        </p>
      </div>
    </div>
  );
}

