"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
    const pathname = usePathname();
    const { user } = useUser();
    const [isStopwatchOpen, setIsStopwatchOpen] = useState(false);

    // Stopwatch State
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    // Timer State
    const [mode, setMode] = useState<"stopwatch" | "timer">("stopwatch");
    const [timerTime, setTimerTime] = useState(0); // in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerInput, setTimerInput] = useState({ hours: 0, minutes: 0 });

    // Stopwatch Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && timerTime > 0) {
            interval = setInterval(() => {
                setTimerTime((prev) => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerTime === 0 && isTimerRunning) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timerTime]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleStopwatch = () => setIsRunning(!isRunning);
    const resetStopwatch = () => { setIsRunning(false); setTime(0); };

    const handleTimerInputChange = (field: "hours" | "minutes", value: string) => {
        const val = parseInt(value) || 0;
        setTimerInput(prev => ({ ...prev, [field]: val }));
    };

    const startTimer = () => {
        const totalSeconds = (timerInput.hours * 3600) + (timerInput.minutes * 60);
        if (totalSeconds > 0) {
            setTimerTime(totalSeconds);
            setIsTimerRunning(true);
        }
    };

    const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimerTime(0);
        setTimerInput({ hours: 0, minutes: 0 });
    };

    // Derived display for Timer when running/paused vs editing
    const showTimerCountdown = isTimerRunning || timerTime > 0;

    return (
        <nav className="flex items-center justify-between px-6 h-16 bg-[#1a1a1a] border-b border-gray-700">
            {/* Left: Logo & Links */}
            <div className="flex items-center space-x-8">
                <Link href="/" className="text-xl font-bold text-white flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">DSAwithPV</span>
                </Link>

                <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link
                        href="/"
                        className={`${pathname === "/" ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/problems"
                        className={`${pathname?.startsWith("/problems") ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
                    >
                        Problems
                    </Link>
                    <Link
                        href="/settings"
                        className={`${pathname === "/settings" ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
                    >
                        Settings
                    </Link>
                </div>
            </div>

            {/* Right: Stopwatch & Profile */}
            <div className="flex items-center space-x-6">

                {/* Stopwatch/Timer Dropdown */}
                <div
                    className="relative group"
                    onMouseEnter={() => setIsStopwatchOpen(true)}
                    onMouseLeave={() => setIsStopwatchOpen(false)}
                >
                    <button className="flex items-center space-x-2 text-gray-400 hover:text-white focus:outline-none transition-colors py-2">
                        {isRunning ? (
                            <span className="font-mono text-blue-400 font-bold">{formatTime(time)}</span>
                        ) : isTimerRunning ? (
                            <span className="font-mono text-orange-400 font-bold">{formatTime(timerTime)}</span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </button>

                    {/* Popover */}
                    <div
                        className={`absolute right-0 top-full mt-1 w-72 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-4 z-50 transform transition-all duration-200 origin-top-right ${isStopwatchOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                            }`}
                    >
                        {/* Mode Switcher */}
                        <div className="flex bg-[#282828] rounded-lg p-1 mb-4">
                            <button
                                onClick={() => setMode("stopwatch")}
                                className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all ${mode === "stopwatch" ? "bg-[#323232] text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setMode("timer")}
                                className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all ${mode === "timer" ? "bg-[#323232] text-orange-400 shadow-sm" : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Stopwatch UI */}
                        {mode === "stopwatch" && (
                            <div className="text-center">
                                <div className="text-4xl font-mono text-white mb-6 font-light tracking-wider">
                                    {formatTime(time)}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={toggleStopwatch}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${isRunning ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-blue-500 text-white hover:bg-blue-600"
                                            }`}
                                    >
                                        {isRunning ? "Stop" : "Start"}
                                    </button>
                                    <button
                                        onClick={resetStopwatch}
                                        className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Timer UI */}
                        {mode === "timer" && (
                            <div className="text-center">
                                {showTimerCountdown ? (
                                    <>
                                        <div className="text-4xl font-mono text-orange-400 mb-6 font-light tracking-wider">
                                            {formatTime(timerTime)}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={toggleTimer}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${isTimerRunning ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-green-500 text-white hover:bg-green-600"
                                                    }`}
                                            >
                                                {isTimerRunning ? "Pause" : "Resume"}
                                            </button>
                                            <button
                                                onClick={resetTimer}
                                                className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-center space-x-2 mb-6 text-white overflow-hidden">
                                            <div className="relative group">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="99"
                                                    value={timerInput.hours.toString().padStart(2, '0')}
                                                    onChange={(e) => handleTimerInputChange("hours", e.target.value)}
                                                    className="w-16 h-16 bg-[#282828] rounded-xl text-3xl text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                                                />
                                                <span className="absolute bottom-1 right-2 text-[10px] text-gray-500 uppercase tracking-wider font-bold">hr</span>
                                            </div>
                                            <span className="text-2xl text-gray-600 mb-2">:</span>
                                            <div className="relative group">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={timerInput.minutes.toString().padStart(2, '0')}
                                                    onChange={(e) => handleTimerInputChange("minutes", e.target.value)}
                                                    className="w-16 h-16 bg-[#282828] rounded-xl text-3xl text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                                                />
                                                <span className="absolute bottom-1 right-2 text-[10px] text-gray-500 uppercase tracking-wider font-bold">min</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={startTimer}
                                            className="w-full py-3 rounded-lg text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                            <span>Start Timer</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <UserButton afterSignOutUrl="/" />
            </div>
        </nav>
    );
}
