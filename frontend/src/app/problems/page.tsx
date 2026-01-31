"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Problem {
    id: number;
    title: string;
    slug: string;
    difficulty: string;
    date_posted: string;
    concepts?: string;
}

export default function ProblemList() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

    // Hardcoded concepts list for now, ideally fetching from backend or deriving from problems
    const conceptsList = [
        "Array", "String", "Two Pointers", "Hash Table", "Math",
        "Binary Search", "Dynamic Programming", "Stack", "Queue",
        "Linked List", "Tree", "Graph"
    ];

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await fetch("/api/problems/");
                if (res.ok) {
                    const data = await res.json();
                    setProblems(data);
                }
            } catch (error) {
                console.error("Failed to fetch problems", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const filteredProblems = selectedConcept
        ? problems.filter(p => p.concepts?.includes(selectedConcept))
        : problems;

    if (loading) return <div className="p-8 text-center">Loading problems...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8">
            {/* Sidebar for Concepts */}
            <aside className="md:w-1/4">
                <h2 className="text-xl font-bold mb-4">Concepts</h2>
                <div className="flex flex-wrap gap-2 md:flex-col">
                    <button
                        onClick={() => setSelectedConcept(null)}
                        className={`text-left px-3 py-2 rounded-lg transition-colors ${selectedConcept === null
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        All Topics
                    </button>
                    {conceptsList.map((concept) => (
                        <button
                            key={concept}
                            onClick={() => setSelectedConcept(concept)}
                            className={`text-left px-3 py-2 rounded-lg transition-colors ${selectedConcept === concept
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                                }`}
                        >
                            {concept}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <h1 className="text-3xl font-bold mb-8">
                    {selectedConcept ? `${selectedConcept} Problems` : "All Problems"}
                </h1>
                <div className="grid gap-4">
                    {filteredProblems.map((problem) => (
                        <Link
                            key={problem.id}
                            href={`/problems/${problem.slug}`}
                            className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition border border-gray-700 hover:border-blue-500"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-semibold">{problem.title}</h2>
                                <span className={`px-3 py-1 rounded text-sm ${problem.difficulty === "Easy" ? "bg-green-900 text-green-200" :
                                    problem.difficulty === "Medium" ? "bg-yellow-900 text-yellow-200" :
                                        "bg-red-900 text-red-200"
                                    }`}>
                                    {problem.difficulty}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {problem.concepts?.split(",").map((c) => (
                                    <span key={c} className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                                        {c.trim()}
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-400 text-sm">Posted on {new Date(problem.date_posted).toLocaleDateString()}</p>
                        </Link>
                    ))}
                </div>
                {filteredProblems.length === 0 && (
                    <div className="text-center text-gray-400 mt-8">
                        No problems found matching this concept.
                    </div>
                )}
            </main>
        </div>
    );
}
