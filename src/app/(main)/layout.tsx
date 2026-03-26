import { Header } from "@/components/layout/header/header";
import MainContainer from "@/components/layout/header/main-container";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <MainContainer>{children}</MainContainer>
    </>
  );
}
