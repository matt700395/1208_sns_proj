"use client";

/**
 * @file components/layout/Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * Desktop: 244px 너비, 아이콘 + 텍스트
 * Tablet: 72px 너비, 아이콘만
 * Mobile: 숨김
 *
 * @see docs/PRD.md - 레이아웃 구조 (섹션 2)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, User } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface SidebarItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: (e?: React.MouseEvent) => void;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { userId } = useAuth();

  const menuItems: SidebarItem[] = [
    {
      href: "/",
      icon: Home,
      label: "홈",
    },
    {
      href: "/search",
      icon: Search,
      label: "검색",
    },
    {
      href: "/create",
      icon: Plus,
      label: "만들기",
      onClick: (e?: React.MouseEvent) => {
        // 추후 CreatePostModal 열기
        e?.preventDefault();
      },
    },
    {
      href: userId ? `/profile/${userId}` : "/profile",
      icon: User,
      label: "프로필",
    },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-[72px] lg:w-[244px] h-screen bg-white border-r border-[#dbdbdb] fixed left-0 top-0 z-40">
      <div className="flex flex-col gap-1 p-2 lg:p-4">
        {/* 로고 (Desktop만 표시) */}
        <div className="hidden lg:block mb-6 px-2">
          <Link href="/" className="text-2xl font-bold text-[#262626]">
            Instagram
          </Link>
        </div>

        {/* 메뉴 항목 */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isProfileActive =
            item.href.startsWith("/profile") &&
            pathname.startsWith("/profile");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.onClick}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                transition-colors duration-200
                ${
                  isActive || isProfileActive
                    ? "font-bold text-[#262626]"
                    : "text-[#262626] hover:bg-gray-50"
                }
              `}
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive || isProfileActive
                    ? "text-[#262626]"
                    : "text-[#262626]"
                }`}
              />
              <span className="hidden lg:inline text-base">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

