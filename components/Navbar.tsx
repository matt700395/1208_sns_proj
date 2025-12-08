import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

/**
 * @file components/Navbar.tsx
 * @description 인증 전용 네비게이션 바
 *
 * 이 컴포넌트는 인증 페이지나 루트 레이아웃에서 사용됩니다.
 * (main) Route Group에서는 사용하지 않으며, 대신 Header/Sidebar를 사용합니다.
 */
const Navbar = () => {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        SaaS Template
      </Link>
      <div className="flex gap-4 items-center">
        <SignedOut>
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
