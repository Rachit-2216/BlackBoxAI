import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { Color, MathUtils, Object3D, type InstancedMesh } from "three";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

type CyberSceneCanvasProps = {
  className?: string;
};

const shardObject = new Object3D();

function MonitorCore({ scrollProgress, reduceMotion }: { scrollProgress: number; reduceMotion: boolean }) {
  const coreRef = useRef<InstancedMesh>(null);
  const core = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const angle = (index / 18) * Math.PI * 2;
        const ring = index % 3;
        return {
          x: Math.cos(angle) * (0.35 + ring * 0.16),
          y: Math.sin(angle) * (0.2 + ring * 0.08),
          z: -0.2 - ring * 0.12,
          rotate: angle,
          scale: 0.025 + ring * 0.006,
        };
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!coreRef.current) {
      return;
    }

    const burst = reduceMotion ? 0.2 : MathUtils.smoothstep(scrollProgress, 0.1, 0.46);
    const pulse = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 2) * 0.04;

    core.forEach((piece, index) => {
      shardObject.position.set(piece.x * (1 + burst * 1.8), piece.y * (1 + burst * 2.4) + pulse, piece.z);
      shardObject.rotation.set(piece.rotate * 0.18, piece.rotate + scrollProgress * 2.4, piece.rotate * 0.72);
      shardObject.scale.set(piece.scale * 2.6, piece.scale * (9 + burst * 10), piece.scale * 0.7);
      shardObject.updateMatrix();
      coreRef.current?.setMatrixAt(index, shardObject.matrix);
    });

    coreRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[0.42, 0.05, -0.35]} rotation={[0.1, -0.18, -0.08]}>
      <instancedMesh ref={coreRef} args={[undefined, undefined, core.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#9fffd1"
          emissive="#35ff8b"
          emissiveIntensity={2.2}
          metalness={0.3}
          roughness={0.18}
          transparent
          opacity={0.88}
        />
      </instancedMesh>
      <mesh>
        <octahedronGeometry args={[0.12, 0]} />
        <meshBasicMaterial color="#72ff9c" transparent opacity={0.68} />
      </mesh>
    </group>
  );
}

function FragmentField({ scrollProgress, reduceMotion }: { scrollProgress: number; reduceMotion: boolean }) {
  const meshRef = useRef<InstancedMesh>(null);
  const fragments = useMemo(
    () =>
      Array.from({ length: 96 }, (_, index) => {
        const angle = index * 2.3999632297;
        const lane = index % 5;
        return {
          baseX: -3.7 + (index % 24) * 0.32,
          baseY: -1.7 + lane * 0.18,
          baseZ: -1.8 - (index % 9) * 0.12,
          waveX: Math.cos(angle) * (0.5 + lane * 0.2),
          waveY: Math.sin(angle) * (0.2 + lane * 0.08),
          scale: 0.012 + (index % 4) * 0.005,
          color: index % 7 === 0 ? new Color("#ff4d36") : index % 4 === 0 ? new Color("#d6ff74") : new Color("#33fff1"),
          rotate: angle,
        };
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }

    const flow = reduceMotion ? 0.25 : scrollProgress;
    fragments.forEach((fragment, index) => {
      const phase = flow * Math.PI * 2 + index * 0.12;
      const drift = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 0.7 + phase) * 0.08;
      shardObject.position.set(
        fragment.baseX + fragment.waveX * flow + drift,
        fragment.baseY + fragment.waveY * flow,
        fragment.baseZ,
      );
      shardObject.rotation.set(fragment.rotate * 0.3, fragment.rotate + flow * 2, fragment.rotate * 0.5);
      shardObject.scale.set(fragment.scale * 8, fragment.scale * (1.6 + flow * 4), fragment.scale * 0.9);
      shardObject.updateMatrix();
      meshRef.current?.setMatrixAt(index, shardObject.matrix);
      meshRef.current?.setColorAt(index, fragment.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, fragments.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0.36} />
    </instancedMesh>
  );
}

function RouteLines({ reduceMotion }: { reduceMotion: boolean }) {
  const lines = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        x: -4.4 + (index % 12) * 0.8,
        y: -1.25 + Math.floor(index / 12) * 0.42,
        z: -2.4 - (index % 6) * 0.12,
        rotate: -0.16 + (index % 4) * 0.1,
        scale: 0.42 + (index % 5) * 0.18,
      })),
    [],
  );

  return (
    <group>
      {lines.map((line, index) => (
        <mesh key={index} position={[line.x, line.y, line.z]} rotation={[0, 0, line.rotate]}>
          <boxGeometry args={[line.scale, 0.005, 0.005]} />
          <meshBasicMaterial color={index % 5 === 0 ? "#e5484d" : "#20f6d2"} transparent opacity={reduceMotion ? 0.14 : 0.24} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ scrollProgress, reduceMotion }: { scrollProgress: number; reduceMotion: boolean }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.12, 5.2 - scrollProgress * 0.55]} fov={43} />
      <ambientLight intensity={0.45} />
      <pointLight position={[0.5, 0.2, 2]} intensity={2.4} color="#72ff9c" />
      <pointLight position={[2.8, -1, 1]} intensity={1.2} color="#ff4d36" />
      <MonitorCore scrollProgress={scrollProgress} reduceMotion={reduceMotion} />
      <FragmentField scrollProgress={scrollProgress} reduceMotion={reduceMotion} />
      <RouteLines reduceMotion={reduceMotion} />
    </>
  );
}

export function CyberSceneCanvas({ className }: CyberSceneCanvasProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll();
  const [scrollProgress, setScrollProgress] = useState(0);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.82, 1], [0.35, 0.85, 0.62, 0.2]);
  const progress = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), {
    stiffness: 90,
    damping: 26,
    mass: 0.36,
  });

  useMotionValueEvent(progress, "change", (latest) => {
    setScrollProgress(Number(latest.toFixed(4)));
  });

  return (
    <motion.div className={className} style={{ opacity }}>
      <Canvas gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} dpr={[1, 1.6]}>
        <Scene scrollProgress={reduceMotion ? 0.38 : scrollProgress} reduceMotion={reduceMotion} />
      </Canvas>
    </motion.div>
  );
}

export default CyberSceneCanvas;
