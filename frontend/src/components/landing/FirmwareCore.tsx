import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import type { MotionValue } from "motion/react";

type Props = {
  opened: boolean;
  progress: MotionValue<number>;
  reduced: boolean;
};
const blocks = Array.from({ length: 27 }, (_, i) => ({
  x: (i % 3) - 1,
  y: (Math.floor(i / 3) % 3) - 1,
  z: Math.floor(i / 9) - 1,
}));

function Assembly({ opened, progress, reduced }: Props) {
  const assembly = useRef<Group>(null);
  const pieces = useRef<(Group | null)[]>([]);
  const scanner = useRef<Group>(null);
  useFrame(({ clock, pointer }, delta) => {
    if (!assembly.current) return;
    const time = reduced ? 0 : clock.elapsedTime;
    const scroll = reduced ? 0 : progress.get();
    const expand = (opened ? 0.62 : 0) + scroll * 0.8;
    const damping = 1 - Math.exp(-Math.min(delta, 0.1) * 5);
    if (scanner.current)
      scanner.current.position.y = reduced ? 0.3 : Math.sin(time * 0.65) * 1.2;
    assembly.current.scale.setScalar(0.9 / (1 + expand * 0.45));
    assembly.current.rotation.x = MathUtils.lerp(
      assembly.current.rotation.x,
      0.36 + (reduced ? 0 : pointer.y * 0.1) + scroll * 0.4,
      damping,
    );
    assembly.current.rotation.y = MathUtils.lerp(
      assembly.current.rotation.y,
      -0.63 +
        (reduced ? 0 : Math.sin(time * 0.17) * 0.15 + pointer.x * 0.18) +
        scroll * 1.2,
      damping,
    );
    assembly.current.rotation.z = MathUtils.lerp(
      assembly.current.rotation.z,
      -0.12 + scroll * 0.22,
      damping,
    );
    blocks.forEach((block, i) => {
      const piece = pieces.current[i];
      if (!piece) return;
      const gap = 0.91 + expand;
      piece.position.x = MathUtils.lerp(
        piece.position.x,
        block.x * gap,
        damping,
      );
      piece.position.y = MathUtils.lerp(
        piece.position.y,
        block.y * gap +
          (reduced ? 0 : Math.sin(time * 0.7 + i) * expand * 0.04),
        damping,
      );
      piece.position.z = MathUtils.lerp(
        piece.position.z,
        block.z * gap,
        damping,
      );
      piece.rotation.z = MathUtils.lerp(
        piece.rotation.z,
        expand * block.x * block.y * 0.32,
        damping,
      );
      piece.rotation.y = MathUtils.lerp(
        piece.rotation.y,
        expand * block.z * 0.18 +
          (reduced ? 0 : Math.sin(time * 0.45 + i) * expand * 0.06),
        damping,
      );
    });
  });
  return (
    <group ref={assembly}>
      {blocks.map((block, i) => (
        <group
          key={i}
          ref={(el) => {
            pieces.current[i] = el;
          }}
          position={[block.x * 0.91, block.y * 0.91, block.z * 0.91]}
        >
          <RoundedBox args={[0.86, 0.86, 0.86]} radius={0.055} smoothness={3}>
            <meshStandardMaterial
              color={i === 13 ? "#d5f28b" : "#b8bec0"}
              metalness={i === 13 ? 0.15 : 0.87}
              roughness={0.24}
              emissive={i === 13 ? "#d5f28b" : "#000000"}
              emissiveIntensity={i === 13 ? 2.1 : 0}
            />
          </RoundedBox>
          {block.z === 1 && (
            <mesh position={[0, -0.28, 0.436]}>
              <boxGeometry args={[0.46, 0.012, 0.008]} />
              <meshBasicMaterial color={i % 3 === 0 ? "#d9ff54" : "#34383a"} />
            </mesh>
          )}
        </group>
      ))}
      <pointLight color="#d9ff54" intensity={opened ? 9 : 2} distance={5} />
      <group ref={scanner}>
        <mesh position={[0, 0, 1.36]}>
          <boxGeometry args={[2.54, 0.012, 0.012]} />
          <meshBasicMaterial color="#a4d6e5" transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function StaticCore() {
  return (
    <div className="static-core" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
class CanvasBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticCore /> : this.props.children;
  }
}
export default function FirmwareCore(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={container}
      className="core-canvas"
      role="img"
      aria-label="A silver firmware cube separated into 27 blocks around a luminous core"
    >
      <CanvasBoundary>
        <Canvas
          camera={{ position: [0, 0.2, 7.8], fov: 36 }}
          dpr={[1, 1.5]}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          fallback={<StaticCore />}
        >
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[4, 7, 5]}
            intensity={4}
            color="#f7f9ff"
          />
          <directionalLight
            position={[-5, -1, 2]}
            intensity={2}
            color="#b8c5d7"
          />
          <Suspense fallback={null}>
            <Environment resolution={128}>
              <Lightformer
                intensity={4}
                position={[0, 5, -3]}
                scale={[8, 3, 1]}
              />
              <Lightformer
                intensity={3}
                position={[-5, 0, 2]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[4, 8, 1]}
              />
              <Lightformer
                intensity={2}
                position={[4, 0, 4]}
                rotation={[0, -Math.PI / 4, 0]}
                scale={[2, 7, 1]}
              />
            </Environment>
            <Assembly {...props} />
          </Suspense>
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
