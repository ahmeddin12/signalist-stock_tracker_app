"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import WatchlistButton from "@/components/WatchlistButton";

interface WatchlistListProps {
  initialItems: StockWithData[];
}

const WatchlistList: React.FC<WatchlistListProps> = ({ initialItems }) => {
  const [items, setItems] = useState<StockWithData[]>(initialItems || []);

  const handleChange = (symbol: string, isAdded: boolean) => {
    if (!isAdded) {
      setItems((prev) => prev.filter((i) => i.symbol !== symbol));
    }
  };

  const empty = items.length === 0;

  if (empty) {
    return (
      <div className="watchlist-empty-container">
        <div className="watchlist-empty">
          <p className="text-gray-300">Your watchlist is empty.</p>
          <p className="text-gray-400 mt-2">
            Go to the stock page and click "Add to Watchlist" to start tracking companies.
          </p>
          <Link href="/search" className="mt-4 inline-block text-yellow-400 hover:text-yellow-300">
            Search for stocks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <ul className="watchlist grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <li key={item.symbol} className="p-4 rounded-lg border border-gray-700 bg-[#0e0e0e]">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/stocks/${item.symbol}`} className="text-lg font-semibold text-gray-100 hover:text-yellow-400">
                  {item.symbol}
                </Link>
                <p className="text-sm text-gray-400">{item.company}</p>
                {item.addedAt ? (
                  <p className="text-xs text-gray-500 mt-1">Added {new Date(item.addedAt).toLocaleDateString()}</p>
                ) : null}
              </div>
              <div>
                <WatchlistButton
                  symbol={item.symbol}
                  company={item.company}
                  isInWatchlist={true}
                  showTrashIcon={true}
                  onWatchlistChange={handleChange}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WatchlistList;
