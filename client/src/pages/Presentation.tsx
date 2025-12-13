import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Download, Share2, ZoomIn } from "lucide-react";
import { Link } from "wouter";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const growthData = [
  { year: "Year 1", height: 1.2, flowers: 0 },
  { year: "Year 2", height: 2.5, flowers: 50 },
  { year: "Year 3", height: 4.1, flowers: 300 },
  { year: "Year 4", height: 5.8, flowers: 1200 },
  { year: "Year 5", height: 7.2, flowers: 3500 },
];

const regionData = [
  { region: "Japan", count: 8500 },
  { region: "USA", count: 3200 },
  { region: "Korea", count: 2800 },
  { region: "China", count: 4100 },
  { region: "Europe", count: 1500 },
];

export default function Presentation() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-8 md:p-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto space-y-12"
      >
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">Project Analysis: Cherry Tree Visualization</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            An interactive overview of the 3D visualization project, exploring growth trends and global distribution.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/">
              <Button size="lg" className="gap-2">
                View 3D Model <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content Tabs */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="trends">Growth Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cherry Tree Growth Trajectory</CardTitle>
                <CardDescription>
                  Analysis of height vs. flower production over the first 5 years.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" stroke="var(--muted-foreground)" />
                    <YAxis yAxisId="left" stroke="var(--primary)" />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--chart-2)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="height" name="Height (m)" stroke="var(--primary)" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="flowers" name="Flower Count" stroke="var(--chart-2)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Rapid Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Trees reach 60% of mature height within the first 3 years.</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Exponential Bloom</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Flower production triples between year 3 and year 4.</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Maturity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Full canopy density is achieved by year 5.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Distribution</CardTitle>
                <CardDescription>
                  Estimated population of ornamental cherry trees by region.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" />
                    <YAxis dataKey="region" type="category" stroke="var(--muted-foreground)" width={80} />
                    <Tooltip 
                      cursor={{ fill: 'var(--muted)' }}
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Tree Count" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <ZoomIn className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Explore Data Intuitively</CardTitle>
                  <CardDescription>
                    Interactive 3D visualization allows users to inspect the model from every angle, understanding the structure and scale in a way static images cannot convey.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Understand Trends Better</CardTitle>
                  <CardDescription>
                    Dynamic charts and data visualizations transform raw numbers into clear, actionable insights about growth patterns and distribution.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Download className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Easily Save or Share</CardTitle>
                  <CardDescription>
                    The web-based platform ensures that these insights are accessible anywhere, with built-in tools to export data or share the interactive experience via a simple link.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Share2 className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Collaborative Access</CardTitle>
                  <CardDescription>
                    Cloud-hosted deployment means stakeholders always see the latest version of the model and data without needing large file downloads.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer CTA */}
        <div className="bg-muted/30 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-light">Ready to explore?</h2>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="default">Launch 3D Viewer</Button>
            </Link>
            <Button variant="outline">Download Report PDF</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
