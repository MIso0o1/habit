import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Info, Leaf, Wind, BarChart3, TreeDeciduous, TreePine } from "lucide-react";
import { useState, useEffect } from "react";\nimport { HabitService } from "@/lib/HabitService";
import { Link, useLocation } from "wouter";
import CherryTreeViewer from "@/components/CherryTreeViewer";
import { useAuth } from "@/contexts/AuthContext";
import HelpDialog from "@/components/HelpDialog";

type TreeType = 'cherry' | 'ficus';

export default function Home() {
  const [showInfo, setShowInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTree, setSelectedTree] = useState<TreeType>('cherry');
  const [treeHealth, setTreeHealth] = useState(100); // State for tree health
  const { isAuthenticated, logout, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchTreeHealth();
    }
  }, [isAuthenticated]);

  const fetchTreeHealth = async () => {
    try {
      const health = await HabitService.fetchTreeHealth();
      setTreeHealth(health);
    } catch (error) {
      console.error('Failed to fetch tree health:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  if (!mounted) return null;

  const treeInfo = {
    cherry: {
      title: "桜",
      subtitle: "Cherry Blossom",
      botanical: "Prunus serrulata, commonly called Japanese cherry, is a species of cherry native to Japan, China and Korea. It is a small deciduous tree with a short single trunk and a dense crown.",
      symbolism: "Cherry blossoms symbolize the transient nature of life. Their short-lived beauty is a reminder to appreciate every moment.",
      stats: {
        polygons: "12,450",
        materials: "PBR",
        textures: "4K",
        format: "GLTF"
      }
    },
    ficus: {
      title: "榕樹",
      subtitle: "Ficus Bonsai",
      botanical: "Ficus retusa, commonly known as the Banyan Fig or Ginseng Ficus, is a species of evergreen tree native to Southeast Asia. It is widely cultivated as a bonsai tree due to its thick trunk and aerial roots.",
      symbolism: "The ficus bonsai represents longevity, harmony, and balance. Its intricate root system symbolizes deep connections and stability.",
      stats: {
        polygons: "18,200",
        materials: "PBR",
        textures: "4K",
        format: "GLB"
      }
    }
  };

  const currentInfo = treeInfo[selectedTree];

  return (
    <div className="min-h-screen bg-background text-foreground font-serif overflow-hidden relative">
      {/* Main Viewer Area */}
      <main className="absolute inset-0 z-0 w-full h-full">
        <CherryTreeViewer selectedTree={selectedTree} treeHealth={treeHealth} />
      </main>

      {/* Floating Header - Zen Minimalist Style */}
      <header className="absolute top-0 left-0 w-full p-8 z-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex justify-between items-start"
        >
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-light tracking-widest text-foreground/90 mix-blend-multiply">
              {currentInfo.title}
            </h1>
            <p className="text-sm md:text-base tracking-[0.3em] uppercase text-muted-foreground ml-1">
              {currentInfo.subtitle}
            </p>
          </div>
        </motion.div>
      </header>

      {/* Navigation and Tree Selection Buttons */}
      <div className="absolute top-8 right-8 z-10 flex flex-col items-end gap-3">
        {/* Dynamic Navigation Links */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="flex gap-3"
        >
          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-full transition-all duration-500 shadow-sm uppercase tracking-[0.3em]"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-white/80 backdrop-blur-sm border-border/50 hover:bg-primary/10 transition-all duration-500 shadow-sm uppercase tracking-[0.3em]"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-white/80 backdrop-blur-sm border-border/50 hover:bg-primary/10 transition-all duration-500 shadow-sm uppercase tracking-[0.3em]"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-white/80 backdrop-blur-sm border-border/50 hover:bg-primary/10 transition-all duration-500 shadow-sm uppercase tracking-[0.3em]"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </motion.div>
        
      </div>

	      {/* Tree Health Display - Bottom Left */}
	      <motion.div
	        initial={{ opacity: 0, y: 20 }}
	        animate={{ opacity: 1, y: 0 }}
	        transition={{ delay: 0.2, duration: 1 }}
	        className="absolute bottom-8 left-8 z-10 pointer-events-none"
	      >
	        <p className="text-sm md:text-base tracking-[0.3em] uppercase text-muted-foreground ml-1">
	          Tree Health: {treeHealth}%
	        </p>
	      </motion.div>
	
	      {/* Floating Controls */}
	      <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col gap-3"
        >
          <HelpDialog />
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 bg-white/80 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:text-primary transition-all duration-500 shadow-sm"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Info Panel - Slide in */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: showInfo ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-white/95 backdrop-blur-md z-20 shadow-xl border-l border-border/20 p-8 overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-light tracking-wide">Details</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowInfo(false)}
              className="hover:bg-transparent hover:text-primary"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-12 flex-1">
            <section>
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Leaf className="w-5 h-5" />
                <h3 className="text-sm uppercase tracking-widest font-medium">Botanical</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed font-sans text-sm">
                {currentInfo.botanical}
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Wind className="w-5 h-5" />
                <h3 className="text-sm uppercase tracking-widest font-medium">Symbolism</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed font-sans text-sm">
                {currentInfo.symbolism}
              </p>
            </section>

            <Card className="p-6 bg-secondary/30 border-none shadow-none">
              <h4 className="text-sm font-medium mb-4 uppercase tracking-wider">Model Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm font-sans text-muted-foreground">
                <div>
                  <span className="block text-xs opacity-50 mb-1">Polygons</span>
                  {currentInfo.stats.polygons}
                </div>
                <div>
                  <span className="block text-xs opacity-50 mb-1">Materials</span>
                  {currentInfo.stats.materials}
                </div>
                <div>
                  <span className="block text-xs opacity-50 mb-1">Textures</span>
                  {currentInfo.stats.textures}
                </div>
                <div>
                  <span className="block text-xs opacity-50 mb-1">Format</span>
                  {currentInfo.stats.format}
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-auto pt-8 border-t border-border/20">
            <p className="text-xs text-center text-muted-foreground/50 font-sans tracking-widest">
              Created by Michal Šomský michal.somsky@protonmail.com
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
