import type { MotionValue } from "motion/react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

const poolFragments = Array.from({ length: 38 }, (_, index) => ({
  id: `pool-${index}`,
  left: `${43 + Math.cos(index * 0.71) * (4 + (index % 5) * 1.5)}vw`,
  top: `${58 + Math.sin(index * 0.83) * (3 + (index % 4) * 1.3)}vh`,
  rotate: `${index * 17 - 90}deg`,
  delay: `${(index % 9) * 0.08}s`,
  size: `${0.42 + (index % 4) * 0.16}rem`,
}));

const shardRoutes = [
  {
    id: "alpha",
    className: "is-alpha",
    x: ["43vw", "34vw", "64vw", "78vw", "42vw", "70vw", "51vw"],
    y: ["61vh", "67vh", "48vh", "64vh", "43vh", "72vh", "55vh"],
    rotate: [-22, 110, 245, 388, 520, 655, 720],
    rotateX: [64, 18, -34, 46, -22, 58, 12],
    rotateY: [-46, 52, 22, -58, 34, -24, 48],
    scale: [0.72, 1.2, 0.92, 1.34, 0.86, 1.16, 1.42],
  },
  {
    id: "beta",
    className: "is-beta",
    x: ["45vw", "55vw", "30vw", "50vw", "74vw", "60vw", "46vw"],
    y: ["58vh", "44vh", "70vh", "38vh", "58vh", "76vh", "55vh"],
    rotate: [18, -96, -212, -336, -480, -606, -690],
    rotateX: [-40, 34, 62, -20, 52, -36, 16],
    rotateY: [58, -34, 18, 64, -56, 28, -38],
    scale: [0.62, 0.96, 1.28, 0.82, 1.38, 0.9, 1.18],
  },
  {
    id: "gamma",
    className: "is-gamma",
    x: ["46vw", "42vw", "72vw", "34vw", "66vw", "82vw", "55vw"],
    y: ["63vh", "52vh", "70vh", "52vh", "40vh", "61vh", "57vh"],
    rotate: [44, 178, 306, 460, 590, 730, 810],
    rotateX: [32, -52, 18, 70, -28, 38, -12],
    rotateY: [-64, -16, 48, -34, 58, -46, 24],
    scale: [0.54, 1.08, 0.84, 1.22, 1, 1.3, 1.08],
  },
];

type ShardRoute = (typeof shardRoutes)[number];

function ShardFlight({
  route,
  routeProgress,
  reduceMotion,
}: {
  route: ShardRoute;
  routeProgress: MotionValue<number>;
  reduceMotion: boolean | null;
}) {
  const stops = [0, 0.16, 0.34, 0.52, 0.7, 0.86, 1];
  const x = useSpring(useTransform(routeProgress, stops, route.x), { stiffness: 72, damping: 20 });
  const y = useSpring(useTransform(routeProgress, stops, route.y), { stiffness: 76, damping: 22 });
  const rotate = useTransform(routeProgress, stops, reduceMotion ? route.rotate.map(() => route.rotate[0]) : route.rotate);
  const rotateX = useTransform(routeProgress, stops, reduceMotion ? route.rotateX.map(() => 0) : route.rotateX);
  const rotateY = useTransform(routeProgress, stops, reduceMotion ? route.rotateY.map(() => 0) : route.rotateY);
  const scale = useTransform(routeProgress, stops, route.scale);

  return (
    <motion.div
      className={`shard-flight ${route.className}`}
      style={{ x, y, rotate, rotateX, rotateY, scale }}
    >
      <div className="shard-guide">
        <span />
      </div>
    </motion.div>
  );
}

export function ShardGuide() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const routeProgress = useTransform(scrollYProgress, [0.12, 0.9], [0, 1]);
  const layerOpacity = useTransform(scrollYProgress, [0, 0.11, 0.17, 0.9, 1], [0, 0, 1, 1, 0.46]);
  const poolOpacity = useTransform(scrollYProgress, [0.1, 0.16, 0.27, 0.38], [0, 1, 0.85, 0.12]);
  const pathLength = useSpring(useTransform(scrollYProgress, [0.16, 0.72], [0, 1]), { stiffness: 86, damping: 24 });

  return (
    <motion.div className="shard-guide-layer" style={{ opacity: layerOpacity }} aria-hidden="true">
      <div className="guide-rail">
        <span style={{ left: "28%", top: "50%" }}>INGEST</span>
        <span style={{ left: "42%", top: "63%" }}>DISASSEMBLE</span>
        <span style={{ left: "56%", top: "52%" }}>DETECT</span>
        <span style={{ left: "69%", top: "61%" }}>MAP</span>
        <span style={{ left: "82%", top: "72%" }}>REPORT</span>
      </div>

      <motion.svg className="guide-path-web" viewBox="0 0 1440 1024" preserveAspectRatio="none">
        <motion.path
          d="M 620 628 C 500 718 470 438 730 500 C 1040 570 1080 310 610 396 C 420 432 890 822 1090 594 C 1240 420 910 352 728 560"
          style={{ pathLength }}
        />
        <motion.path
          d="M 650 604 C 830 360 390 820 620 380 C 794 50 1128 618 910 790 C 692 960 1094 438 650 586"
          style={{ pathLength }}
        />
        <motion.path
          d="M 634 652 C 440 510 990 770 514 532 C 282 416 972 290 1178 520 C 1336 696 798 820 730 580"
          style={{ pathLength }}
        />
      </motion.svg>

      <motion.div className="fragment-pool-fixed" style={{ opacity: poolOpacity }}>
        {poolFragments.map((fragment) => (
          <span
            key={fragment.id}
            style={{
              left: fragment.left,
              top: fragment.top,
              width: fragment.size,
              height: `calc(${fragment.size} * 2.8)`,
              transform: `rotate(${fragment.rotate})`,
              animationDelay: fragment.delay,
            }}
          />
        ))}
      </motion.div>

      <div className="shard-flight-deck">
        {shardRoutes.map((route) => (
          <ShardFlight key={route.id} route={route} routeProgress={routeProgress} reduceMotion={reduceMotion} />
        ))}
      </div>
    </motion.div>
  );
}

export default ShardGuide;
