import React, { useState, useEffect, useRef } from "react";
import {
  FaCompass,
  FaPlay,
  FaPause,
  FaRedo,
  FaChevronDown,
  FaChevronUp,
  FaRoute,
  FaStore,
} from "react-icons/fa";

const PRESETS = [
  { name: "Store (QuickBite HQ)", lat: 31.5204, lng: 74.3587 },
  { name: "Gulberg Main", lat: 31.5102, lng: 74.3440 },
  { name: "Model Town", lat: 31.4826, lng: 74.3256 },
  { name: "DHA Phase 5", lat: 31.4685, lng: 74.4020 },
];

export default function RiderGpsSimulator({
  currentLocation = { lat: 31.5204, lng: 74.3587 },
  destination = null,
  onLocationUpdate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customLat, setCustomLat] = useState(currentLocation?.lat || 31.5204);
  const [customLng, setCustomLng] = useState(currentLocation?.lng || 74.3587);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSteps, setSimSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (currentLocation?.lat && currentLocation?.lng && !isSimulating) {
      setCustomLat(currentLocation.lat);
      setCustomLng(currentLocation.lng);
    }
  }, [currentLocation, isSimulating]);

  // Generate 25 linear interpolation steps towards destination
  const generateSteps = (start, end, numSteps = 25) => {
    const steps = [];
    for (let i = 0; i <= numSteps; i++) {
      const fraction = i / numSteps;
      const lat = start.lat + (end.lat - start.lat) * fraction;
      const lng = start.lng + (end.lng - start.lng) * fraction;
      steps.push({
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
      });
    }
    return steps;
  };

  const handleStartSimulation = () => {
    const targetDest = destination || { lat: 31.4826, lng: 74.3256 }; // Default Model Town
    const startLoc = {
      lat: parseFloat(customLat) || 31.5204,
      lng: parseFloat(customLng) || 74.3587,
    };
    const steps = generateSteps(startLoc, targetDest, 25);
    setSimSteps(steps);
    setCurrentStepIndex(0);
    setIsSimulating(true);
  };

  const handlePauseSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleResetToStore = () => {
    setIsSimulating(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentStepIndex(0);
    setSimSteps([]);
    setCustomLat(31.5204);
    setCustomLng(74.3587);
    if (onLocationUpdate) {
      onLocationUpdate({ lat: 31.5204, lng: 74.3587 });
    }
  };

  // Step-by-Step Simulation Timer
  useEffect(() => {
    if (isSimulating && simSteps.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= simSteps.length - 1) {
            setIsSimulating(false);
            clearInterval(intervalRef.current);
            return prev;
          }
          const nextIndex = prev + 1;
          const nextPos = simSteps[nextIndex];
          if (nextPos && onLocationUpdate) {
            onLocationUpdate(nextPos);
          }
          return nextIndex;
        });
      }, 1400);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSimulating, simSteps, onLocationUpdate]);

  const handleApplyManual = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng) && onLocationUpdate) {
      onLocationUpdate({ lat, lng });
    }
  };

  const handleSelectPreset = (preset) => {
    setCustomLat(preset.lat);
    setCustomLng(preset.lng);
    if (onLocationUpdate) {
      onLocationUpdate({ lat: preset.lat, lng: preset.lng });
    }
  };

  const progress =
    simSteps.length > 1
      ? Math.round((currentStepIndex / (simSteps.length - 1)) * 100)
      : 0;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-[99999] flex flex-col items-end pointer-events-auto select-none">
      {/* Drawer Card */}
      {isOpen && (
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-2 border-amber-500 rounded-2xl p-4 w-72 sm:w-80 shadow-2xl mb-2.5 transition-all animate-in zoom-in-95 duration-150 text-stone-900 dark:text-white">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-neutral-800 mb-3">
            <div className="flex items-center gap-1.5 font-['Oswald',sans-serif] text-sm font-bold uppercase tracking-wider text-amber-500">
              <FaCompass className="text-amber-500" />
              <span>Dev GPS Simulator</span>
            </div>
            <button
              type="button"
              onClick={handleResetToStore}
              className="text-[10px] bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-amber-400 active:scale-95 flex items-center gap-1"
              title="Reset coordinates to Lahore Store HQ"
            >
              <FaStore className="text-[9px]" />
              <span>Reset HQ</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[10px] font-bold text-stone-500 dark:text-neutral-400 uppercase tracking-wider block">
              Quick Lahore Presets:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="py-1.5 px-2 rounded-lg bg-stone-100 dark:bg-neutral-800 hover:bg-amber-500/15 dark:hover:bg-amber-500/20 text-stone-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 text-[11px] font-semibold border border-stone-200 dark:border-neutral-700 text-left truncate transition-colors cursor-pointer"
                  title={`${p.name} (${p.lat}, ${p.lng})`}
                >
                  📍 {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Lat / Lng Inputs */}
          <form onSubmit={handleApplyManual} className="space-y-2 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-stone-500 dark:text-neutral-400 block mb-0.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-mono rounded-lg bg-stone-50 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-stone-500 dark:text-neutral-400 block mb-0.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-mono rounded-lg bg-stone-50 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-800 dark:text-neutral-200 font-bold text-xs rounded-lg border border-stone-300 dark:border-neutral-700 cursor-pointer transition-colors"
            >
              Apply Coordinates
            </button>
          </form>

          {/* Automated Ride Simulation Controls */}
          <div className="pt-2 border-t border-stone-200 dark:border-neutral-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold flex items-center gap-1 text-stone-700 dark:text-neutral-300">
                <FaRoute className="text-amber-500 text-[11px]" />
                <span>Ride Simulation</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-amber-500">
                {progress}% {progress === 100 ? "🎯 Arrived" : ""}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Sim Buttons */}
            <div className="flex gap-1.5">
              {!isSimulating ? (
                <button
                  type="button"
                  onClick={handleStartSimulation}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs uppercase font-['Oswald',sans-serif] tracking-wider rounded-xl cursor-pointer transition-all border-none flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FaPlay className="text-[10px]" />
                  <span>Start Ride</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseSimulation}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-black text-xs uppercase font-['Oswald',sans-serif] tracking-wider rounded-xl cursor-pointer transition-all border-none flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FaPause className="text-[10px]" />
                  <span>Pause Ride</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetToStore}
                className="px-3 py-2 bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 text-xs rounded-xl border border-stone-300 dark:border-neutral-700 cursor-pointer transition-colors"
                title="Reset to Store"
              >
                <FaRedo className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="py-2.5 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 cursor-pointer border-2 border-white dark:border-neutral-800 active:scale-95 transition-all ring-4 ring-amber-500/20"
      >
        <span>🛠️ DEV GPS SIMULATOR</span>
        {isOpen ? <FaChevronDown className="text-xs" /> : <FaChevronUp className="text-xs" />}
      </button>
    </div>
  );
}
