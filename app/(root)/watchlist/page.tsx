import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlistItemsByEmail } from "@/lib/actions/watchlist.actions";
import WatchlistList from "@/components/WatchlistList";

export default async function WatchlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email || "";

  const items = email ? await getWatchlistItemsByEmail(email) : [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-100 mb-6">Your Watchlist</h1>
      <WatchlistList initialItems={items} />
    </div>
  );
}
