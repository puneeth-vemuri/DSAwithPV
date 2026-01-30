
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
    <div ref={container} className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-[#0e0e0e] text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto space-y-8">
        {/* Badge */}
        <div className="hero-badge inline-flex items-center px-3 py-1 rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm text-xs font-medium text-gray-300">
          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          Community Driven DSA Platform
        </div>

        {/* Hero Text */}
        <h1 className="hero-title text-5xl md:text-7xl font-bold tracking-tight">
          Master <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">DSA</span> <br className="hidden md:block" />
          One Problem at a Time.
        </h1>

        <p className="hero-desc max-w-2xl text-lg md:text-xl text-gray-400 leading-relaxed">
          A dedicated space to solve Data Structures and Algorithms problems, share your unique solutions, and learn from the community. Join us in building a repository of knowledge.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Link
            href="/problems"
            className="hero-btn px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center"
          >
            Start Solving
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/problems"
            className="hero-btn px-8 py-4 rounded-full border border-gray-700 bg-[#1a1a1a] text-white font-bold text-lg hover:bg-[#252525] transition-all hover:border-gray-500"
          >
            View Solutions
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="feature-card p-6 rounded-2xl bg-[#1a1a1a] border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Practice Code</h3>
            <p className="text-gray-400 text-sm">Solve problems in an integrated IDE supporting Python, Java, and C++.</p>
          </div>
          <div className="feature-card p-6 rounded-2xl bg-[#1a1a1a] border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Community Solutions</h3>
            <p className="text-gray-400 text-sm">See how others approached the problem and share your own optimized solutions.</p>
          </div>
          <div className="feature-card p-6 rounded-2xl bg-[#1a1a1a] border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Track Progress</h3>
            <p className="text-gray-400 text-sm">Keep track of solved problems, your submission history, and performance.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

