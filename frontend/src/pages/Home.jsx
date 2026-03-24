import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import { fetchProducts } from "../redux/slices/productSlice";
import HeroCarousel from "../components/HeroCarousel";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, CAT_ICONS, OFFERS } from "../utils/constants";
import { ProductCardSkeleton } from "../components/Skeleton";
import QuickView from "../components/QuickView";

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Rating: High → Low", value: "rating-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Name: A → Z", value: "name-asc" },
];

export default function Home() {
  const dispatch = useDispatch();
  const { products, loading, error, total, pages } = useSelector(s => s.products);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => { setSearch(searchParams.get("q") || ""); }, [searchParams]);
  useEffect(() => {
    const params = {
      q: search || undefined,
      category: activeCategory === "All" ? undefined : activeCategory,
      sort: sortBy,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      page: page,
      limit,
    };
    dispatch(fetchProducts(params));
  }, [dispatch, search, activeCategory, sortBy, minPrice, maxPrice, page]);

  const filtered = products || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="animate-fade-in">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Marquee Offers */}
      <motion.div className="offers-strip" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="offers-inner">
          {[...OFFERS, ...OFFERS].map((o, i) => (
            <span key={i} className="offer-item">{o}</span>
          ))}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div className="search-wrap" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: "spring" }}>
        <span className="search-icon">🔍</span>
        <input className="search-input" placeholder="Search for rice, dal, oil, biscuits…" value={search} onChange={e => setSearch(e.target.value)} />
        <AnimatePresence>
          {search && (
            <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="search-clear" onClick={() => setSearch("")}>✕</motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Price Range */}
      <motion.div className="price-range" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ display: "flex", gap: "0.5rem", alignItems: "center", margin: "0.6rem 0" }}>
        <input type="number" min={0} placeholder="Min price" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: 120, padding: "0.45rem 0.6rem", borderRadius: 8, border: "1px solid var(--border-color)" }} />
        <input type="number" min={0} placeholder="Max price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: 120, padding: "0.45rem 0.6rem", borderRadius: 8, border: "1px solid var(--border-color)" }} />
        <button onClick={() => setPage(1)} style={{ padding: "0.45rem 0.8rem", borderRadius: 8, background: "var(--primary)", color: "#fff", border: "none", cursor: "pointer" }}>Apply</button>
        {(minPrice || maxPrice) && (
          <button onClick={() => { setMinPrice(""); setMaxPrice(""); setPage(1); }} style={{ padding: "0.45rem 0.8rem", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-color)", cursor: "pointer" }}>Clear</button>
        )}
      </motion.div>

      {/* Category Chips */}
      <motion.div className="cat-chips-wrap" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5, type: "spring" }}>
        {CATEGORIES.map((cat, i) => (
          <motion.button key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.05), type: "spring", bounce: 0.6 }} whileHover={{ scale: 1.1, y: -4 }} whileTap={{ scale: 0.95 }} className={`cat-chip ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>
            {CAT_ICONS[cat]} {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Products Header + Sort */}
      <motion.div className="section-header" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="section-title">{activeCategory === "All" ? "All Products" : activeCategory}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {!loading && (
            <motion.span className="product-count" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
              {filtered.length} items
            </motion.span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-full)", padding: "0.3rem 0.5rem 0.3rem 0.75rem" }}>
            <ArrowUpDown size={14} color="var(--text-secondary)" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", paddingRight: "0.25rem" }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}
      {error && <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="state-card error"><span>⚠️</span><p>{error}</p></motion.div>}

      {!loading && !error && filtered.length === 0 && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="state-card">
          <motion.span style={{ fontSize: "3rem" }} animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}>🛒</motion.span>
          <h3>No products found</h3>
          <p>{products.length === 0 ? "Run the seed script to populate products." : "Try a different search or category."}</p>
        </motion.div>
      )}

      {/* Product Grid */}
      <motion.div className="product-grid" layout>
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 60, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }} transition={{ duration: 0.5, delay: i * 0.1, type: "spring", bounce: 0.5 }} layout>
              <ProductCard product={p} onQuickView={() => setQuickViewProduct(p)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {!loading && !error && (typeof total !== 'undefined' ? total > 0 : filtered.length > 0) && (
        <div className="pagination" style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '1.2rem 0' }}>
          <button className="page-btn" onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page <= 1}>Prev</button>
          {Array.from({ length: pages || 1 }).map((_, i) => (
            <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="page-btn" onClick={() => setPage(prev => Math.min(pages || 1, prev + 1))} disabled={page >= (pages || 1)}>Next</button>
        </div>
      )}
      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </motion.div>
  );
}
