export default function WorkshopGlyph({ kind = 0 }: { kind?: number }) {
  return (
    <svg
      className="workshop-glyph"
      viewBox="0 0 200 130"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 108H183"
        stroke="#315c49"
        strokeWidth="1"
        strokeDasharray="3 5"
      />
      {kind === 0 ? (
        <>
          <rect
            x="26"
            y="26"
            width="70"
            height="73"
            rx="4"
            fill="#f8d985"
            transform="rotate(-7 26 26)"
          />
          <rect
            x="104"
            y="17"
            width="65"
            height="82"
            rx="4"
            fill="#eeb5a3"
            transform="rotate(6 104 17)"
          />
          <path
            d="M46 50h31M44 62h31M43 74h17M119 44h31M117 56h31"
            stroke="#365b49"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="133" cy="80" r="9" fill="#2d6854" />
          <circle cx="77" cy="91" r="7" fill="#2d6854" />
        </>
      ) : kind === 1 ? (
        <>
          <path
            d="M35 67C67 20 115 17 155 50M35 67C66 112 125 111 161 71"
            stroke="#47735b"
            strokeWidth="2"
          />
          <circle cx="34" cy="66" r="19" fill="#f8d985" />
          <rect x="82" y="44" width="40" height="44" rx="6" fill="#accacb" />
          <circle cx="164" cy="64" r="22" fill="#eeb5a3" />
          <path
            d="M53 66h28m42 0h17"
            stroke="#315c49"
            strokeWidth="2"
            strokeDasharray="3 4"
          />
          <circle cx="102" cy="66" r="6" fill="#315c49" />
        </>
      ) : kind === 2 ? (
        <>
          <path d="M40 40h55v48h54M96 40h51" stroke="#315c49" strokeWidth="2" />
          <rect x="20" y="22" width="42" height="36" rx="5" fill="#f8d985" />
          <rect x="76" y="72" width="42" height="36" rx="5" fill="#accacb" />
          <rect x="140" y="23" width="42" height="36" rx="5" fill="#eeb5a3" />
          <circle cx="160" cy="88" r="17" fill="#315c49" />
          <path d="m153 87 5 5 9-10" stroke="white" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d="M55 101V23" stroke="#315c49" strokeWidth="3" />
          <path
            d="M55 24c31-14 51 17 82 2v42c-31 15-51-17-82-2V24Z"
            fill="#f8d985"
            stroke="#315c49"
            strokeWidth="1.5"
          />
          <circle cx="141" cy="88" r="22" fill="#eeb5a3" />
          <path d="m130 88 7 7 14-16" stroke="#315c49" strokeWidth="3" />
          <path d="m38 106 17-8 18 8" stroke="#315c49" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
