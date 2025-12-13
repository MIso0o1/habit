import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasConsented = localStorage.getItem('cookieConsent');
        if (!hasConsented) {
            // Show consent banner after a short delay
            setTimeout(() => setShowConsent(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setShowConsent(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'false');
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-500">
            <Card className="p-4 shadow-2xl border-2 bg-white/95 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Cookie className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Cookie Notice</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            We use essential cookies to keep you logged in and ensure the website functions properly. 
                            No tracking or analytics cookies are used.
                        </p>
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleAccept} 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                            >
                                Accept
                            </Button>
                            <Button 
                                onClick={handleDecline} 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                            >
                                Decline
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
