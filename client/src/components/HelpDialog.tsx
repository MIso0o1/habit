import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle, TreeDeciduous, TrendingDown, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

export default function HelpDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 bg-white/80 backdrop-blur-sm border-border/50 hover:bg-primary/10 transition-all duration-300 shadow-sm"
                    title="How it works"
                >
                    <HelpCircle className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <TreeDeciduous className="w-6 h-6 text-green-600" />
                        How the Habit & Skill Tracker Works
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Build consistency and watch your tree flourish
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Overview */}
                    <section>
                        <h3 className="text-lg font-semibold mb-2">Overview</h3>
                        <p className="text-muted-foreground">
                            This is a visual habit and skill tracker that uses a beautiful 3D tree to represent your progress. 
                            Your tree's health reflects your commitment to your daily habits. Stay consistent, and watch your tree thrive!
                        </p>
                    </section>

                    {/* How It Works */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">1</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Create Your Habits</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Add daily habits or skills you want to track on your Dashboard. These can be anything: exercise, reading, meditation, learning a new language, etc.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-green-600 font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Check Off Daily</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Each day, mark your habits as complete by checking them off. Your tree starts at 100% health.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-purple-600 font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Daily Check after 23:00</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Every day after 23:00 (11:00 PM), the system automatically checks your habit completion for that day.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tree Health System */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3">Tree Health System</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-green-700 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Tree Grows (+25 Health)
                                    </h4>
                                    <p className="text-sm text-green-700">
                                        When you complete <strong>all</strong> your habits for the day, your tree gains 25 health points. 
                                        More flowers appear, making your tree more vibrant!
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-red-700 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" />
                                        Tree Decays (-25 Health)
                                    </h4>
                                    <p className="text-sm text-red-700">
                                        When you miss <strong>any</strong> habit for the day, your tree loses 25 health points. 
                                        Flowers start to disappear, showing the impact of inconsistency.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Health Stages */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3">Health Stages</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                <span className="font-medium">100% Health</span>
                                <span className="text-muted-foreground">Full bloom - all flowers visible</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                <span className="font-medium">86-99% Health</span>
                                <span className="text-muted-foreground">50% of flowers visible</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                                <span className="font-medium">61-85% Health</span>
                                <span className="text-muted-foreground">20% of flowers visible</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                <span className="font-medium">31-60% Health</span>
                                <span className="text-muted-foreground">5% of flowers visible</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-red-100 rounded">
                                <span className="font-medium">1-30% Health</span>
                                <span className="text-muted-foreground">2% of flowers visible</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                <span className="font-medium">0% Health</span>
                                <span className="text-muted-foreground">Completely bare - no flowers</span>
                            </div>
                        </div>
                    </section>

                    {/* Tips */}
                    <section className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold mb-2 text-blue-900">💡 Tips for Success</h3>
                        <ul className="space-y-1 text-sm text-blue-800">
                            <li>• Start with 2-3 manageable habits rather than overwhelming yourself</li>
                            <li>• Check off your habits throughout the day, not just at the end</li>
                            <li>• Your tree health is capped between 0% and 100%</li>
                            <li>• Consistency is key - even one missed habit affects your tree</li>
                            <li>• Use the delete button (trash icon) to remove habits you no longer want to track</li>
                        </ul>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
