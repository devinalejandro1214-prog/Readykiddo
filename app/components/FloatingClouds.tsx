export default function FloatingClouds() {
  return (
    <>
      <style>{`
        @keyframes float-cloud-1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(100px,-50px)} }
        @keyframes float-cloud-2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-80px,60px)} }
        @keyframes float-cloud-3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(120px,-40px)} }
        @keyframes float-cloud-4 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-60px,80px)} }
        @keyframes float-cloud-5 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(90px,-70px)} }
        @keyframes float-cloud-6 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(70px,-55px)} }
        .rk-cloud-1 { animation: float-cloud-1 20s ease-in-out infinite; }
        .rk-cloud-2 { animation: float-cloud-2 25s ease-in-out infinite 2s; }
        .rk-cloud-3 { animation: float-cloud-3 22s ease-in-out infinite 5s; }
        .rk-cloud-4 { animation: float-cloud-4 18s ease-in-out infinite 3s; }
        .rk-cloud-5 { animation: float-cloud-5 24s ease-in-out infinite 7s; }
        .rk-cloud-6 { animation: float-cloud-6 21s ease-in-out infinite 4s; }
      `}</style>

      <div className="rk-cloud-1 absolute pointer-events-none" style={{ top: 40, left: 40, opacity: 0.5 }}>
        <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
          <path d="M30 65 Q10 65 10 48 Q10 35 22 32 Q20 20 32 18 Q38 8 52 12 Q58 4 72 6 Q86 2 92 14 Q104 10 110 22 Q122 20 126 32 Q138 30 140 42 Q148 44 148 54 Q148 65 134 65 Z" fill="#FF9933" opacity="0.5"/>
        </svg>
      </div>

      <div className="rk-cloud-2 absolute pointer-events-none" style={{ top: '25%', right: 40, opacity: 0.4 }}>
        <svg width="140" height="70" viewBox="0 0 140 70" fill="none">
          <path d="M25 58 Q8 58 8 44 Q8 32 18 29 Q16 18 28 16 Q34 7 46 10 Q52 3 64 5 Q76 1 82 12 Q92 8 98 19 Q108 17 112 28 Q122 26 124 37 Q130 39 130 48 Q130 58 118 58 Z" fill="#FF9933" opacity="0.5"/>
        </svg>
      </div>

      <div className="rk-cloud-3 absolute pointer-events-none" style={{ bottom: '25%', left: '25%', opacity: 0.45 }}>
        <svg width="130" height="65" viewBox="0 0 130 65" fill="none">
          <path d="M22 54 Q6 54 6 40 Q6 29 16 26 Q14 16 25 14 Q30 6 42 9 Q47 2 58 4 Q69 0 74 11 Q83 8 89 18 Q98 16 102 26 Q111 24 113 34 Q119 36 119 44 Q119 54 108 54 Z" fill="#FF9933" opacity="0.5"/>
        </svg>
      </div>

      <div className="rk-cloud-4 absolute pointer-events-none" style={{ top: '50%', right: '25%', opacity: 0.35 }}>
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
          <path d="M20 50 Q5 50 5 37 Q5 27 14 24 Q12 15 22 13 Q27 5 38 8 Q43 2 53 4 Q63 0 68 10 Q76 7 82 16 Q90 15 94 24 Q102 22 104 31 Q109 33 109 41 Q109 50 99 50 Z" fill="#FF9933" opacity="0.5"/>
        </svg>
      </div>

      <div className="rk-cloud-5 absolute pointer-events-none" style={{ bottom: 40, right: 64, opacity: 0.4 }}>
        <svg width="150" height="75" viewBox="0 0 150 75" fill="none">
          <path d="M28 62 Q9 62 9 47 Q9 34 20 31 Q18 20 30 17 Q36 8 50 11 Q56 3 69 5 Q82 1 88 13 Q99 9 105 21 Q116 19 120 31 Q131 29 133 40 Q140 42 140 52 Q140 62 127 62 Z" fill="#FF9933" opacity="0.5"/>
        </svg>
      </div>

      <div className="rk-cloud-6 absolute pointer-events-none" style={{ top: '66%', left: 40, opacity: 0.38 }}>
        <svg width="125" height="62" viewBox="0 0 125 62" fill="none">
          <path d="M21 52 Q6 52 6 39 Q6 28 15 25 Q13 16 23 14 Q28 6 39 9 Q44 2 54 4 Q64 0 69 10 Q77 8 83 17 Q91 15 95 25 Q103 23 105 32 Q110 34 110 42 Q110 52 100 52 Z" fill="#FF9933" opacity="0.5"/>
        </svg>
      </div>
    </>
  );
}
