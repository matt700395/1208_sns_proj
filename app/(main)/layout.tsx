/**
 * @file app/(main)/layout.tsx
 * @description Instagram SNS 메인 레이아웃
 *
 * 이 레이아웃은 인증된 사용자를 위한 메인 앱 레이아웃입니다.
 * - Desktop: Sidebar (244px) + Main Content (최대 630px)
 * - Tablet: Sidebar (72px, 아이콘만) + Main Content
 * - Mobile: Header (60px) + Main Content + BottomNav (50px)
 *
 * @see docs/PRD.md - 레이아웃 구조 (섹션 2)
 */

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Mobile Header */}
      <Header />

      <div className="flex">
        {/* Desktop/Tablet Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 w-full md:ml-[72px] lg:ml-[244px] md:max-w-[630px] md:mx-auto pt-[60px] md:pt-0 pb-[50px] md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile BottomNav */}
      <BottomNav />
    </div>
  );
}

