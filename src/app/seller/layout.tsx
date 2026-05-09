import SellerSidebar from "@/features/seller/components/seller-sidebar";
import { requireSeller } from "@/features/seller/utils/require-seller";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSeller();

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <SellerSidebar />

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
