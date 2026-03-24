import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SLIDES = [
  {
    id: 1,
    title: "ताज़ा सामान,\nbेस्ट कीमत!",
    subtitle: "Fresh groceries · Household essentials · Daily needs",
    coupon: "KIRANA10 — 10% off first order!",
    bg: "linear-gradient(135deg, #F97316 0%, #EAB308 100%)",
  },
  {
    id: 2,
    title: "Daily essentials delivered",
    subtitle: "Fast delivery · Trusted brands · Great prices",
    coupon: "SAVE50 — ₹50 off above ₹500",
    bg: "linear-gradient(135deg, #059669 0%, #16A34A 100%)",
  },
  {
    id: 3,
    title: "Local produce, fresh & affordable",
    subtitle: "Support local sellers · Quality assured",
    coupon: "FRESH20 — 20% off (up to ₹200)",
    bg: "linear-gradient(135deg, #0EA5A4 0%, #06B6D4 100%)",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setIndex(i => (i - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setIndex(i => (i + 1) % SLIDES.length);

  return (
    <div className="hero-carousel">
      <div className="hero-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {SLIDES.map((s, i) => (
          <div className={`hero-slide ${i === index ? 'active' : ''}`} key={s.id} style={{ background: s.bg }}>
            <div className="hero-content">
              <div className="hero-tag">🎉 Grand Opening Sale</div>
              <h1 className="hero-heading" dangerouslySetInnerHTML={{ __html: s.title.replace('\n', '<br/>') }} />
              <p className="hero-sub">{s.subtitle}</p>
              <div className="hero-coupon">🏷️ Code <strong>{s.coupon.split('—')[0].trim()}</strong> — {s.coupon.split('—')[1]?.trim()}</div>
            </div>
            <div className="hero-emoji">🛒<br/>🥦🧅🥬</div>
          </div>
        ))}
      </div>

      <div className="hero-controls">
        <button onClick={prev} aria-label="Previous slide" className="hero-ctrl">‹</button>
        <div className="hero-dots">
          {SLIDES.map((s, i) => (
            <button key={s.id} onClick={() => setIndex(i)} className={`dot ${i === index ? 'active' : ''}`} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
        <button onClick={next} aria-label="Next slide" className="hero-ctrl">›</button>
      </div>
    </div>
  );
}
