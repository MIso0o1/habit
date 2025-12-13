import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useState, useRef, useEffect, useMemo } from "react";
import { Progress } from "./ui/progress"; // Assuming this path is correct

interface TreeModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  treeHealth: number;
}

function TreeModel({ modelPath, scale = 0.6, position = [0, -1.4, 0], treeHealth }: TreeModelProps) {
  const isCherry = modelPath.includes("scene.gltf");
  const isFicus = modelPath.includes("ficus_bonsai.glb");
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<any>(null);
  const meshRefs = useRef<Map<string, any>>(new Map());

  // Use a ref to store the meshes that will decay
  const decayMeshes = useRef<any[]>([]);

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    decayMeshes.current = []; // Clear the ref for the new scene

    // Find and store references to different parts
    cloned.traverse((child: any) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        
        // 1. Hide flying petals (as per user's last request)
        if (name.includes("flying")) {
          child.visible = false;
        } 
        
        // 2. Identify meshes for decay
        if (isCherry && (name.includes("flower") || name.includes("bud") || name.includes("stalk"))) {
          decayMeshes.current.push(child);
        } else if (isFicus && (name.includes("leaf") || name.includes("leaves") || name.includes("foliage"))) {
          // Assuming Ficus leaves are named 'leaf', 'leaves', or 'foliage'
          decayMeshes.current.push(child);
        }
        
        // Store all meshes for potential future use
        meshRefs.current.set(child.name, child);
      }
    });
    return cloned;
  }, [scene]);

  // Effect to handle visual decay based on health - MUCH MORE AGGRESSIVE
  useEffect(() => {
    // This effect runs whenever treeHealth changes
    const meshes = decayMeshes.current;
    if (meshes.length === 0) return;

    const totalMeshes = meshes.length;
    let meshesToHide = 0;

    if (treeHealth <= 0) {
      // Stage 5: Health 0 - All vanish (100%)
      meshesToHide = totalMeshes;
    } else if (treeHealth <= 30) {
      // Stage 4: Health <= 30 - 98% vanish (Near complete decay)
      meshesToHide = Math.floor(totalMeshes * 0.98);
    } else if (treeHealth <= 60) {
      // Stage 3: Health <= 60 - 95% vanish (Extreme decay)
      meshesToHide = Math.floor(totalMeshes * 0.95);
    } else if (treeHealth <= 85) {
      // Stage 2: Health <= 85 - 80% vanish (Major decay)
      meshesToHide = Math.floor(totalMeshes * 0.80);
    } else if (treeHealth < 100) {
      // Stage 1: Health 86-99 - 50% vanish (Clear visual difference from 100%)
      meshesToHide = Math.floor(totalMeshes * 0.50);
    }

    // Ensure we don't hide more than available
    meshesToHide = Math.min(meshesToHide, totalMeshes);

    // Reset visibility for all decay meshes
    meshes.forEach(mesh => {
      mesh.visible = true;
    });

    // Hide the required number of meshes
    for (let i = 0; i < meshesToHide; i++) {
      // Use a consistent, but arbitrary, selection for which meshes to hide
      // For simplicity, we'll hide the first 'meshesToHide' meshes in the array
      meshes[i].visible = false;
    }

  }, [treeHealth]);

  return (
    <group ref={groupRef}>
         <primitive object={clonedScene} scale={scale} position={position} />
    </group>
  );
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-muted-foreground">Loading tree...</p>
      </div>
    </div>
  );
}

interface CherryTreeViewerProps {
  selectedTree?: 'cherry' | 'ficus';
}

export default function CherryTreeViewer({ selectedTree = 'cherry', treeHealth = 100 }: CherryTreeViewerProps & { treeHealth?: number }) {
  const [loaded, setLoaded] = useState(false);

  // Configure model settings based on selected tree
  const treeConfig = {
    cherry: {
      path: "/models/scene.gltf",
      scale: 0.55,
      position: [0, -1.4, 0] as [number, number, number],
      cameraPosition: [1.2, 1.3, 5] as [number, number, number],
    },
    ficus: {
      path: "/models/ficus_bonsai.glb",
      scale: 2.2,
      position: [0.05, -0.65, 0] as [number, number, number],
      cameraPosition: [0, 0.5, -3] as [number, number, number],
    }
  };

  const config = treeConfig[selectedTree];

  return (
    <div className="w-full h-full min-h-[600px] relative bg-white">
      {!loaded && <LoadingScreen />}
      


      <Canvas
        key={selectedTree} // Key the Canvas to force re-render and reset camera controls
        camera={{ position: config.cameraPosition, fov: 45 }}
        shadows
        className="w-full h-full"
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={() => setLoaded(true)}
      >
        <color attach="background" args={["#ffffff"]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1.2}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.6} />
        
        {/* Environment */}
        <Environment preset="sunset" />
        
        {/* Model */}
        <Suspense fallback={null}>
          <TreeModel 
            key={selectedTree} 
            modelPath={config.path}
            scale={config.scale}
            position={config.position}
            treeHealth={treeHealth}
          />
        </Suspense>
        
        {/* Controls */}
        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={10}
          /*autoRotate*/
          autoRotateSpeed={0.5}
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-sm text-muted-foreground tracking-[0.2em] uppercase opacity-50">
          Drag to Rotate • Scroll to Zoom
        </p>
      </div>
    </div>
  );
}
