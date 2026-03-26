import { HeaderSearch } from "@/components/layout/header/header-search";
import { simLoading } from "@/lib/utils";

export default async function Home() {
  await simLoading(3);
  return (
    <>
      <div className="my-4 sm:hidden">
        <HeaderSearch />
      </div>
    </>
  );
}
