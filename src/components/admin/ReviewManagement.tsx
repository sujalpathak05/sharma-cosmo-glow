import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";

type Review = {
  id: string;
  name: string;
  treatment: string;
  rating: number;
  text: string;
  is_approved: boolean;
  created_at: string;
};

const ReviewManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to fetch reviews");
    else setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    const channel = supabase
      .channel("admin-reviews")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        void fetchReviews();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const toggleApproval = async (id: string, approve: boolean) => {
    setUpdating(id);
    const { error } = await supabase.from("reviews").update({ is_approved: approve }).eq("id", id);
    if (error) toast.error("Failed to update review");
    else {
      toast.success(approve ? "Review approved & published" : "Review hidden from website");
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: approve } : r));
    }
    setUpdating(null);
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setUpdating(id);
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error("Failed to delete review");
    else {
      toast.success("Review deleted");
      setReviews(prev => prev.filter(r => r.id !== id));
    }
    setUpdating(null);
  };

  const filtered = filter === "all" ? reviews : filter === "pending" ? reviews.filter(r => !r.is_approved) : reviews.filter(r => r.is_approved);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {(["all", "pending", "approved"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f} ({f === "all" ? reviews.length : f === "pending" ? reviews.filter(r => !r.is_approved).length : reviews.filter(r => r.is_approved).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground font-body">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="glass-panel spotlight-card rounded-[26px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-display text-lg font-semibold text-foreground">{r.name}</h3>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${r.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {r.is_approved ? "Published" : "Pending"}
                    </span>
                  </div>
                  <p className="font-body text-sm text-primary mb-2">{r.treatment}</p>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? "fill-gold text-gold" : "text-border"} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground font-body italic">"{r.text}"</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  {!r.is_approved ? (
                    <button onClick={() => toggleApproval(r.id, true)} disabled={updating === r.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50">
                      <CheckCircle2 size={14} /> Approve
                    </button>
                  ) : (
                    <button onClick={() => toggleApproval(r.id, false)} disabled={updating === r.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors disabled:opacity-50">
                      <XCircle size={14} /> Hide
                    </button>
                  )}
                  <button onClick={() => deleteReview(r.id)} disabled={updating === r.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;

