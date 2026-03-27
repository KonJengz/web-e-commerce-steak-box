import { Suspense } from "react";

import { Header } from "@/components/layout/header/header";
import MainContainer from "@/components/layout/header/main-container";
import { MainHeaderSkeleton } from "@/components/shared/loading-skeletons";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<MainHeaderSkeleton />}>
        <Header />
      </Suspense>
      <MainContainer>{children}</MainContainer>
    </>
  );
}
