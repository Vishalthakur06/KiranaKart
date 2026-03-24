export function ProductCardSkeleton() {
  return (
    <div className="product-card" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
      <div style={{ width: "100%", aspectRatio: "1/1", background: "var(--border-color)" }} />
      <div className="product-card-body">
        <div style={{ height: "16px", background: "var(--border-color)", borderRadius: "4px", marginBottom: "8px", width: "80%" }} />
        <div style={{ height: "12px", background: "var(--border-color)", borderRadius: "4px", marginBottom: "4px" }} />
        <div style={{ height: "12px", background: "var(--border-color)", borderRadius: "4px", width: "60%" }} />
        <div className="product-card-footer" style={{ marginTop: "12px" }}>
          <div style={{ height: "20px", background: "var(--border-color)", borderRadius: "4px", width: "50px" }} />
          <div style={{ height: "32px", background: "var(--border-color)", borderRadius: "8px", width: "80px" }} />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)", overflow: "hidden", animation: "pulse 1.5s ease-in-out infinite" }}>
      <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between" }}>
        <div style={{ height: "20px", background: "var(--border-color)", borderRadius: "4px", width: "150px" }} />
        <div style={{ height: "28px", background: "var(--border-color)", borderRadius: "20px", width: "100px" }} />
      </div>
      <div style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ width: "60px", height: "60px", background: "var(--border-color)", borderRadius: "12px" }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: "16px", background: "var(--border-color)", borderRadius: "4px", marginBottom: "8px", width: "70%" }} />
            <div style={{ height: "12px", background: "var(--border-color)", borderRadius: "4px", width: "40%" }} />
          </div>
        </div>
        <div style={{ height: "1px", background: "var(--border-color)", margin: "1rem 0" }} />
        <div style={{ height: "24px", background: "var(--border-color)", borderRadius: "4px", width: "120px" }} />
      </div>
    </div>
  );
}
