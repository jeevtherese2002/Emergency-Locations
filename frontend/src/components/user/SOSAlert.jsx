import React, { useState, useEffect, use } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SOSAlert = () => {
  const [isTriggered, setIsTriggered] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastTriggerTime, setLastTriggerTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const COOLDOWN_PERIOD = 30000; // 30 seconds cooldown

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSOSClick = async () => {
    const currentTime = Date.now();
    
    // Check if still in cooldown period
    if (currentTime - lastTriggerTime < COOLDOWN_PERIOD) {
      const remainingTime = Math.ceil((COOLDOWN_PERIOD - (currentTime - lastTriggerTime)) / 1000);
      toast.info(`Please wait ${remainingTime} seconds before sending another SOS alert.`);
      return;
    }

    setIsTriggered(true);
    setIsSending(true);
    setLastTriggerTime(currentTime);
    setCountdown(30); // Start 30 second countdown

    // Simulate sending SOS alert
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success("Emergency contacts have been notified. Help is on the way.");

      setIsSending(false);
      
      // Reset after animation
      setTimeout(() => {
        setIsTriggered(false);
      }, 1000);

    } catch (error) {
      toast.error("Failed to send SOS alert. Please try again.");
      setIsSending(false);
      setIsTriggered(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-emergency/5 to-emergency/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emergency/30 rounded-full animate-pulse blur-xl"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-emergency/20 rounded-full animate-pulse blur-lg animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-emergency/25 rounded-full animate-pulse blur-md animation-delay-2000"></div>
      </div>

      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/user/dashboard")}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Emergency SOS</h1>
                <p className="text-sm text-muted-foreground">
                  Press the button below in case of emergency
                </p>
              </div>
            </div>
            {countdown > 0 && (
              <div className="text-sm text-muted-foreground">
                Next alert available in: <span className="font-mono font-bold">{countdown}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main SOS Interface */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
        <div className="text-center max-w-md mx-auto">
          
          {/* Emergency Info */}
          <div className="mb-8">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-emergency animate-pulse" />
            <h2 className="text-3xl font-bold text-foreground mb-2">Emergency SOS</h2>
            <p className="text-muted-foreground leading-relaxed">
              Press and hold the SOS button below to immediately alert your emergency contacts. 
              Use this feature only during real emergencies.
            </p>
          </div>

          {/* SOS Button Container */}
          <div className="relative">
            {/* Pulsing Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-emergency/20 animate-ping animation-duration-2000"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full bg-emergency/10 animate-ping animation-duration-3000 animation-delay-500"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 rounded-full bg-emergency/5 animate-ping animation-duration-4000 animation-delay-1000"></div>
            </div>

            {/* Main SOS Button */}
            <div className="relative z-10">
              <button
                onClick={handleSOSClick}
                disabled={isSending || countdown > 0}
                className={`
                  w-48 h-48 rounded-full font-bold text-2xl transition-all duration-300
                  ${isSending 
                    ? 'bg-yellow-500 text-yellow-50 animate-pulse scale-110' 
                    : isTriggered 
                      ? 'bg-success text-success-foreground scale-110 animate-bounce' 
                      : countdown > 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                        : 'bg-emergency text-emergency-foreground hover:scale-110 active:animate-ping shadow-glow hover:shadow-[0_0_60px_hsl(var(--emergency)/0.6)]'
                  }
                  ${!isSending && !isTriggered && countdown === 0 ? 'animate-pulse' : ''}
                  ${isTriggered && !isSending ? 'animate-bounce' : ''}
                `}
                style={{
                  boxShadow: isSending ? '0 0 40px hsl(var(--emergency) / 0.8)' : 
                            countdown === 0 ? '0 0 30px hsl(var(--emergency) / 0.4)' : 'none'
                }}
              >
                {isSending ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-lg">Sending...</span>
                  </div>
                ) : isTriggered ? (
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">Sent!</span>
                  </div>
                ) : countdown > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-mono mb-1">{countdown}</div>
                    <span className="text-sm">Cooldown</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black mb-1">SOS</span>
                    <span className="text-sm uppercase tracking-widest">Emergency</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3">What happens when you press SOS?</h3>
            <div className="space-y-2 text-sm text-muted-foreground text-left">
              <div className="flex items-start gap-2">
                <span className="text-emergency font-bold">1.</span>
                <span>All your emergency contacts will receive an immediate alert</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emergency font-bold">2.</span>
                <span>Your current location will be shared with them</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emergency font-bold">3.</span>
                <span>Local emergency services may be notified</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emergency font-bold">4.</span>
                <span>You'll have a 30-second cooldown before next alert</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSAlert;