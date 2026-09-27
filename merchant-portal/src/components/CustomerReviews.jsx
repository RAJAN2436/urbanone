import React from 'react';
import { useMerchant } from '../context/MerchantContext';
import { Star, MessageSquare } from 'lucide-react';

export const CustomerReviews = () => {
  const { currentMerchant } = useMerchant();

  const reviews = Array.isArray(currentMerchant?.reviews) ? currentMerchant.reviews : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="clean-card p-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-zinc-950 font-['Outfit']">Customer Ratings & Reviews</h3>
          <p className="text-xs text-zinc-500 font-medium">Customer reviews directly impact your placement on Customer App.</p>
        </div>
        <div className="text-xl font-black text-[#ea580c] flex items-center gap-1">
          <Star className="w-5 h-5 fill-current text-[#f97316]" />
          <span>{currentMerchant?.rating ? `${currentMerchant.rating} / 5.0` : 'New Store (No ratings yet)'}</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="clean-card p-10 text-center text-zinc-400 space-y-2">
          <MessageSquare className="w-8 h-8 mx-auto text-zinc-300" />
          <div className="text-sm font-bold text-zinc-600">No customer reviews yet</div>
          <div className="text-xs text-zinc-400">Reviews from verified customer orders will appear here in real-time.</div>
        </div>
      ) : (
        reviews.map((rev) => (
          <div key={rev.id} className="clean-card p-5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-zinc-950">{rev.user} • <span className="text-[#ea580c]">{'★'.repeat(Math.floor(rev.rating))}</span></div>
              <span className="text-zinc-400 text-[11px] font-medium">{rev.time}</span>
            </div>
            <div className="text-zinc-600 font-medium leading-relaxed">{rev.comment}</div>
            {rev.dish && <div className="text-[11px] text-[#ea580c] font-bold">Ordered: {rev.dish}</div>}
          </div>
        ))
      )}
    </div>
  );
};
