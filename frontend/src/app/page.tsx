
"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Home() {
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(".hero-badge", {
      y: -20,
      autoAlpha: 0,
      duration: 0.8,
      ease: "power3.out",
      clearProps: "all"
    })
      .from(".hero-title", {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.2,
        clearProps: "all"
      }, "-=0.4")
      .from(".hero-desc", {
        y: 20,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "all"
      }, "-=0.6")
      .from(".hero-btn", {
        y: 20,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        clearProps: "all"
      }, "-=0.4")
      .from(".feature-card", {
        y: 40,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        clearProps: "all"
      }, "-=0.4");

  }, { scope: container });

  return (
    <div ref={container} className="flex h-[calc(100vh-64px)] flex-col items-center justify-between bg-[#0e0e0e] text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto flex-grow justify-center py-4">
        {/* Badge */}
        <div className="hero-badge inline-flex items-center px-3 py-1 rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm text-xs font-medium text-gray-300 mb-6">
          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          Community Driven DSA Platform
        </div>

        {/* Hero Text */}
        <h1 className="hero-title text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
          Master <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">DSA</span> <br className="hidden md:block" />
          One Problem at a Time.
        </h1>

        <p className="hero-desc max-w-2xl text-base md:text-lg text-gray-400 leading-relaxed mb-6">
          A dedicated space to solve Data Structures and Algorithms problems, share your unique solutions, and learn from the community.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <Link
            href="/problems"
            className="hero-btn px-6 py-3 rounded-full bg-white text-black font-bold text-base hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center"
          >
            Start Solving
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/problems"
            className="hero-btn px-6 py-3 rounded-full border border-gray-700 bg-[#1a1a1a] text-white font-bold text-base hover:bg-[#252525] transition-all hover:border-gray-500"
          >
            View Solutions
          </Link>
        </div>

        {/* Feature Grid - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left max-w-4xl">
          <div className="feature-card p-4 rounded-xl bg-[#1a1a1a]/80 border border-gray-800 hover:border-gray-700 transition-colors backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Example Code</h3>
            </div>
            <p className="text-gray-400 text-xs">Run Python, Java, and C++ code instantly.</p>
          </div>
          <div className="feature-card p-4 rounded-xl bg-[#1a1a1a]/80 border border-gray-800 hover:border-gray-700 transition-colors backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Community</h3>
            </div>
            <p className="text-gray-400 text-xs">Share and browse solutions.</p>
          </div>
          <div className="feature-card p-4 rounded-xl bg-[#1a1a1a]/80 border border-gray-800 hover:border-gray-700 transition-colors backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Progress</h3>
            </div>
            <p className="text-gray-400 text-xs">Track your solved problems.</p>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-gray-800/50 py-4 z-10 bg-[#0e0e0e]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-gray-500 text-xs">
          <div className="mb-2 md:mb-0">
            &copy; {new Date().getFullYear()} All rights reserved by <span className="text-gray-300 font-medium">Puneeth Vemuri</span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/puneeth-vemuri"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              <span className="hidden md:inline">GitHub</span>
            </a>
            <a
              href="https://puneethvemuri.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span className="hidden md:inline">Portfolio</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

