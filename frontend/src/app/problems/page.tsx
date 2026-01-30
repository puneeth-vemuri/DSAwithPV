"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Problem {
    id: number;
    title: string;
    slug: string;
    difficulty: string;
    date_posted: string;
}

export default function ProblemList() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-center">Loading problems...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Daily Problems</h1>
            <div className="grid gap-4">
                {problems.map((problem) => (
                    <Link
                        key={problem.id}
                        href={`/problems/${problem.slug}`}
                        className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition border border-gray-700 hover:border-blue-500"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{problem.title}</h2>
                            <span className={`px-3 py-1 rounded text-sm ${problem.difficulty === "Easy" ? "bg-green-900 text-green-200" :
                                    problem.difficulty === "Medium" ? "bg-yellow-900 text-yellow-200" :
                                        "bg-red-900 text-red-200"
                                }`}>
                                {problem.difficulty}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">Posted on {new Date(problem.date_posted).toLocaleDateString()}</p>
                    </Link>
                ))}
            </div>
            {problems.length === 0 && (
                <div className="text-center text-gray-400 mt-8">
                    No problems posted yet. Check back tomorrow!
                </div>
            )}
        </div>
    );
}
