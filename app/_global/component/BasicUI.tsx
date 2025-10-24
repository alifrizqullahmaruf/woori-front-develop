"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useCallback } from "react";
import { Back, LaurenLogo } from "@/app/_common/component/atoms/Icon";
import Footer from "@/app/_global/component/Footer";

interface BasicUIProps {
  children?: ReactNode;
  hideFooter?: boolean;
}

export default function BasicUI({
  children,
  hideFooter = false,
}: Readonly<BasicUIProps>) {
  const [pageDepth, pathname] = useCalculatePathDepth();

  const shouldHideFooter = hideFooter || pathname.includes("/company-info/");

  
  const handleBackButtonClick = useCallback(() => {
    if (pageDepth >= 2) {
      window.history.back();
    } else {
      window.close();
    }
  }, [pageDepth]);

  return (
    <main
      className={
        "mx-auto flex min-h-screen max-w-[1080px] flex-col overflow-x-hidden"
      }
      style={{
        backgroundColor: pathname.includes("issues/latest")
          ? "#2684ff"
          : "white",
      }}
    >
      <nav className={"flex w-full flex-col"}>
        <div className={"relative flex items-center justify-between px-3 py-5"}>
          <button
            className={"p-2"}
            onClick={handleBackButtonClick}
            title={"뒤로가기"}
          >
            <Back className={"size-5"} />
          </button>
          {pageDepth < 3 && (
            <div
              className={
                "text-gray-w400 bold typo-micro flex items-center gap-1"
              }
            >
              by <LaurenLogo className={"rounded-sm"} />
            </div>
          )}
        </div>
      </nav>
      {children}
      {/* <Footer /> */}
      {!shouldHideFooter && <Footer />}
    </main>
  );
}

const useCalculatePathDepth = () => {
  const pathname = usePathname();

  return [pathname.split("/").length - 1, pathname] as const;
};
