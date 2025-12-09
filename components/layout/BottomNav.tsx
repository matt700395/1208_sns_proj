"use client";

/**
 * @file components/layout/BottomNav.tsx
 * @description Instagram 스타일 하단 네비게이션 컴포넌트
 *
 * Mobile 전용 (50px 높이)
 * 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 *
 * @see docs/PRD.md - 레이아웃 구조 (섹션 2)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface BottomNavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { userId } = useAuth();

  const navItems: BottomNavItem[] = [
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
      href: "/activity",
      icon: Heart,
      label: "좋아요",
    },
    {
      href: userId ? `/profile/${userId}` : "/profile",
      icon: User,
      label: "프로필",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-[#dbdbdb] z-50 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const isProfileActive =
          item.href.startsWith("/profile") && pathname.startsWith("/profile");

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={item.onClick}
            className={`
              flex flex-col items-center justify-center
              transition-colors duration-200
              ${
                isActive || isProfileActive
                  ? "text-[#262626]"
                  : "text-[#262626] opacity-60"
              }
            `}
            aria-label={item.label}
          >
            <Icon className="w-6 h-6" />
          </Link>
        );
      })}
    </nav>
  );
}




