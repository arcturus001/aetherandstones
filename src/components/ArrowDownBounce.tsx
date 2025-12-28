import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

export const ArrowDownBounce = () => {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    // Try fetching from CDN, fallback to inline animation
    const fetchAnimation = async () => {
      const urls = [
        'https://assets5.lottiefiles.com/packages/lf20_mXVB1I6SyD.json',
        'https://lottie.host/api/animations/mXVB1I6SyD/download'
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setAnimationData(data);
            return;
          }
        } catch (error) {
          continue;
        }
      }

      // Fallback: Arrow down bounce animation (white chevron)
      setAnimationData({
        v: "5.7.4",
        fr: 30,
        ip: 0,
        op: 60,
        w: 24,
        h: 24,
        nm: "Arrow Down Bounce",
        ddd: 0,
        assets: [],
        layers: [{
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: "Arrow",
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            r: { a: 0, k: 0 },
            p: { a: 1, k: [
              { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 0, s: [12, 12, 0] },
              { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 15, s: [12, 18, 0] },
              { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 30, s: [12, 12, 0] },
              { t: 60, s: [12, 12, 0] }
            ] },
            a: { a: 0, k: [0, 0, 0] },
            s: { a: 0, k: [100, 100, 100] }
          },
          ao: 0,
          shapes: [{
            ty: "gr",
            it: [{
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  i: [[0,0],[0,0],[0,0]],
                  o: [[0,0],[0,0],[0,0]],
                  v: [[-6,-2],[0,6],[6,-2]],
                  c: true
                }
              },
              nm: "Path 1"
            }, {
              ty: "st",
              c: { a: 0, k: [1, 1, 1, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 2 },
              lc: 2,
              lj: 2,
              ml: 4,
              bm: 0,
              nm: "Stroke 1"
            }, {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
              nm: "Transform"
            }],
            nm: "Arrow Shape",
            np: 2,
            cix: 2,
            bm: 0
          }],
          ip: 0,
          op: 60,
          st: 0,
          bm: 0
        }]
      });
    };

    fetchAnimation();
  }, []);

  if (!animationData) {
    return null;
  }

  return (
    <div className="arrow-down-bounce" style={{
      position: 'absolute',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 15,
      width: '48px',
      height: '48px',
      filter: 'brightness(0) invert(1)', // Makes the animation white
      pointerEvents: 'none',
    }}>
      <Lottie
        animationData={animationData}
        loop={true}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

