import React, { useState, useEffect } from "react";
import { AlertTriangle, MessageSquarePlus } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DEFAULT_MESSAGE = "Urgent assistance needed.";
const COOLDOWN_PERIOD = 30000; // 30s
const MESSAGE_LIMIT = 200;

const SOSAlert = () => {
  // phase: 'idle' | 'contacts' | 'services' | 'nearby' | 'done'
  const [phase, setPhase] = useState("idle");
  const [isTriggered, setIsTriggered] = useState(false);
  const [lastTriggerTime, setLastTriggerTime] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // Custom message UI
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [messageCharsLeft, setMessageCharsLeft] = useState(MESSAGE_LIMIT);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  /* Effects */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  useEffect(() => {
    setMessageCharsLeft(MESSAGE_LIMIT - customMessage.length);
  }, [customMessage]);

  /* Derived states */
  const isProcessing = ["contacts", "services", "nearby"].includes(phase);
  const buttonDisabled = isProcessing || countdown > 0;

  async function postJSON(url, token, bodyObj) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyObj || {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || `Request failed (${res.status})`);
    }
    return data;
  }

  function resetUI({ preserveMessage = false } = {}) {
    setPhase("idle");
    setIsTriggered(false);
    if (!preserveMessage) {
      setCustomMessage("");
      setShowMessageBox(false);
    }
    // countdown purposely NOT reset (you still want cooldown to run)
  }

  const handleSOSClick = async () => {
    const now = Date.now();
    if (now - lastTriggerTime < COOLDOWN_PERIOD) {
      const remain = Math.ceil((COOLDOWN_PERIOD - (now - lastTriggerTime)) / 1000);
      toast.info(`Please wait ${remain}s before sending another SOS.`);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    const trimmed = customMessage.trim();
    const messageToSend =
      trimmed.length > 0 ? trimmed.slice(0, MESSAGE_LIMIT) : DEFAULT_MESSAGE;

    setIsTriggered(true);
    setPhase("contacts");
    setLastTriggerTime(now);
    setCountdown(COOLDOWN_PERIOD / 1000);

    let contactsResult = null;
    let servicesResult = null;
    let nearbyResult = null;

    try {
      // 1) Contacts
      try {
        contactsResult = await postJSON(
          `${BASE_URL}/api/sos/contacts`,
          token,
          { message: messageToSend }
        );
        if (contactsResult.dispatched > 0) {
          toast.success(
            `Contacts: ${contactsResult.dispatched}/${contactsResult.totalContacts}`
          );
        } else {
          toast.warn("No contacts to notify.");
        }
      } catch (e) {
        toast.error(`Contacts failed: ${e.message}`);
      }

      // 2) Services
      setPhase("services");
      try {
        servicesResult = await postJSON(
          `${BASE_URL}/api/sos/services`,
          token,
          { message: messageToSend }
        );
        if (servicesResult.servicesNotified > 0) {
          toast.success(`Services: ${servicesResult.servicesNotified}`);
        } else {
          toast.info("No nearby services found.");
        }
      } catch (e) {
        toast.warn(`Services failed: ${e.message}`);
      }

      // 3) Nearby Users
      setPhase("nearby");
      try {
        nearbyResult = await postJSON(
          `${BASE_URL}/api/sos/nearby-users`,
          token,
          { message: messageToSend }
        );
        if (nearbyResult.nearbyNotified > 0) {
          toast.success(`Nearby users: ${nearbyResult.nearbyNotified}`);
        } else {
          toast.info("No nearby users found.");
        }
      } catch (e) {
        toast.warn(`Nearby users failed: ${e.message}`);
      }

      setPhase("done");
      toast.info(
        `SOS Complete: Contacts=${contactsResult?.dispatched ?? 0} | Services=${servicesResult?.servicesNotified ?? 0} | Nearby=${nearbyResult?.nearbyNotified ?? 0}`
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "SOS failed");
      resetUI({ preserveMessage: true }); // maybe keep message if failed
      return;
    } finally {
      // After short success animation, reset UI & clear message
      setTimeout(() => {
        resetUI({ preserveMessage: false });
      }, 1000);
    }
  };

  const phaseLabelMap = {
    idle: "SOS",
    contacts: "Contacts…",
    services: "Services…",
    nearby: "Nearby…",
    done: "Sent!",
  };

  const renderButtonContent = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-lg">{phaseLabelMap[phase]}</span>
        </div>
      );
    }
    if (phase === "done" || isTriggered) {
      return (
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-lg">Sent!</span>
        </div>
      );
    }
    if (countdown > 0) {
      return (
        <div className="flex flex-col items-center">
          <div className="text-3xl font-mono mb-1">{countdown}</div>
          <span className="text-sm">Cooldown</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center">
        <span className="text-4xl font-black mb-1">SOS</span>
        <span className="text-sm uppercase tracking-widest">Emergency</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-emergency/5 to-emergency/10 relative overflow-hidden">
      {/* Background (decorative) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emergency/30 rounded-full animate-pulse blur-xl" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-emergency/20 rounded-full animate-pulse blur-lg animation-delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-emergency/25 rounded-full animate-pulse blur-md animation-delay-2000" />
      </div>

      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Emergency SOS
              </h1>
              <p className="text-sm text-muted-foreground">
                Press the button below in case of emergency
              </p>
            </div>
          </div>
          {countdown > 0 && (
            <div className="text-sm text-muted-foreground">
              Next alert in:{" "}
              <span className="font-mono font-bold">{countdown}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-emergency animate-pulse" />
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Emergency SOS
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Alert contacts, services, and nearby users. Add a custom message
              or let us send the default.
            </p>
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setShowMessageBox((p) => !p)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-muted text-sm font-medium transition disabled:opacity-50"
            >
              <MessageSquarePlus className="w-4 h-4" />
              {showMessageBox ? "Hide Custom Message" : "Add Custom Message"}
            </button>

            {showMessageBox && (
              <div className="mt-3 text-left">
                <textarea
                  disabled={isProcessing}
                  value={customMessage}
                  maxLength={MESSAGE_LIMIT}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  placeholder={`(Optional) Describe your situation (max ${MESSAGE_LIMIT} chars)\nDefault if blank: "${DEFAULT_MESSAGE}"`}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:ring-2 focus:ring-emergency/40 outline-none resize-none"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>
                    {customMessage.trim()
                      ? "Custom message will be sent."
                      : `Default: "${DEFAULT_MESSAGE}"`}
                  </span>
                  <span>{messageCharsLeft} left</span>
                </div>
              </div>
            )}
          </div>

          {/* SOS Button + Rings */}
          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full bg-emergency/20 animate-ping animation-duration-2000" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full bg-emergency/10 animate-ping animation-duration-3000 animation-delay-500" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 rounded-full bg-emergency/5 animate-ping animation-duration-4000 animation-delay-1000" />
            </div>

            <div className="relative z-10">
              <button
                onClick={handleSOSClick}
                disabled={buttonDisabled}
                className={`
                  w-48 h-48 rounded-full font-bold text-2xl transition-all duration-300
                  ${isProcessing
                    ? "bg-yellow-500 text-yellow-50 animate-pulse scale-110"
                    : isTriggered
                      ? "bg-success text-success-foreground scale-110 animate-bounce"
                      : countdown > 0
                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                        : "bg-emergency text-emergency-foreground hover:scale-110 active:animate-ping shadow-glow hover:shadow-[0_0_60px_hsl(var(--emergency)/0.6)]"
                  }
                  ${!isProcessing && !isTriggered && countdown === 0
                    ? "animate-pulse"
                    : ""
                  }
                `}
                style={{
                  boxShadow: isProcessing
                    ? "0 0 40px hsl(var(--emergency) / 0.8)"
                    : countdown === 0
                      ? "0 0 30px hsl(var(--emergency) / 0.4)"
                      : "none",
                }}
              >
                {renderButtonContent()}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border text-left">
            <h3 className="font-semibold text-foreground mb-3">
              What happens when you press SOS?
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Emergency contacts are emailed.</li>
              <li>Your current location is shared.</li>
              <li>Nearby services are notified.</li>
              <li>Nearby users (up to 3) are alerted.</li>
              <li>
                We send your custom message or the default “{DEFAULT_MESSAGE}”.
              </li>
              <li>30‑second cooldown prevents spamming.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSAlert;