import Link from "next/link";
import { redirect } from "next/navigation";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;

  const orderId = params.orderId;

  if (!orderId) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl">
          ?
        </div>

        <h1 className="mb-3 text-3xl font-bold">
          Order Placed Successfully
        </h1>

        <p className="mb-6 text-muted-foreground">
          Your order has been placed successfully.
          The seller will process your order shortly.
        </p>

        <div className="mb-8 rounded-2xl bg-muted p-4 text-sm">
          Order ID: {orderId}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/orders"
            className="flex-1 rounded-2xl bg-black px-5 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
          >
            View Orders
          </Link>

          <Link
            href="/"
            className="flex-1 rounded-2xl border px-5 py-3 text-center text-sm font-medium transition hover:bg-muted"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
