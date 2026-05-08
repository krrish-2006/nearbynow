import LogoutButton from "@/features/auth/components/logout-button";
import { requireBuyer } from "@/features/auth/utils/protected";
import SearchBar from "@/components/shared/search-bar";

export default async function BuyerPage() {
  const profile = await requireBuyer();

  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {profile.full_name}</h1>

            <p className="mt-1 text-neutral-600">Find products near you</p>
          </div>

          <LogoutButton />
        </div>

        <SearchBar />
      </div>
    </main>
  );
}
