"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";


interface TestCase {
    input_data: string;
    expected_output: string;
    is_hidden: boolean;
}
// ... (skipping interfaces for brevity in replacement search if possible, but safer to use context)
// Actually I will just target the specific blocks.

// Block 1: Imports
import Editor from "@monaco-editor/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TestCase {
    input_data: string;
    expected_output: string;
    is_hidden: boolean;
}

interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    input_format: string;
    output_format: string;
    constraints: string;
    editorial?: string;
    test_cases: TestCase[];
}

export default function ProblemDetail() {
    const { slug } = useParams();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [language, setLanguage] = useState("python");

    const boilerplates = {
        python: `# Write your solution here
class Solution:
    def twoSum(self, nums, target):
        pass`,
        java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[]{};
    }
}`
    };

    // Load from localStorage or use boilerplate
    const [code, setCode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`code_${slug}_python`);
            return saved || boilerplates.python;
        }
        return boilerplates.python;
    });

    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(true);

    // Save to localStorage whenever code changes
    useEffect(() => {
        if (slug) {
            localStorage.setItem(`code_${slug}_${language}`, code);
        }
    }, [code, slug, language]);

    // Update code when language changes
    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        const saved = localStorage.getItem(`code_${slug}_${newLang}`);
        setCode(saved || boilerplates[newLang as keyof typeof boilerplates]);
    };

    const [activeTab, setActiveTab] = useState<"description" | "solutions" | "submissions">("description");
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [solutionsData, setSolutionsData] = useState<{ official: any, community: any[] } | null>(null);

    useEffect(() => {
        if (!slug) return;
        const fetchProblem = async () => {
            try {
                const res = await fetch(`/api/problems/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setProblem(data);
                } else {
                    setOutput("Problem not found");
                }
            } catch (error) {
                console.error("Failed to fetch problem", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [slug]);

    const { user } = useUser();

    // Fetch User Submissions
    useEffect(() => {
        if (activeTab === "submissions" && problem?.id && user?.id) {
            const fetchSubmissions = async () => {
                try {
                    const res = await fetch(`/api/submissions/?problem_id=${problem.id}&clerk_id=${user.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSubmissions(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch submissions", error);
                }
            };
            fetchSubmissions();
        }
    }, [activeTab, problem?.id, user?.id]);

    // Fetch Solutions (Official + Community)
    useEffect(() => {
        if (activeTab === "solutions" && problem?.id) {
            const fetchSolutions = async () => {
                try {
                    const res = await fetch(`/api/submissions/solutions/${problem.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSolutionsData(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch solutions", error);
                }
            };
            fetchSolutions();
        }
    }, [activeTab, problem?.id]);

    const handleRun = async () => {
        setOutput("Running...");

        // Map languages to Piston IDs (simple mapping for now)
        const languageMap: Record<string, number> = {
            "python": 71,
            "java": 62,
            "cpp": 54
        };

        const payload = {
            source_code: code,
            language_id: languageMap[language],
            stdin: "" // run_test handles stdin from DB
        };

        try {
            // Updated to call the new endpoint that wraps code with driver
            const res = await fetch(`/api/execute/run_test?problem_id=${problem?.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Execution failed");
            }

            const data = await res.json();
            if (data.stderr) {
                setOutput(`Error:\n${data.stderr}`);
            } else {
                setOutput(data.stdout || "No output");
            }
        } catch (error: any) {
            setOutput(`Failed: ${error.message}`);
        }
    };

    // const { user } = useUser(); // Moved to top level

    // ...

    const handleSubmit = async () => {
        if (!user) {
            setOutput("Please sign in to submit a solution.");
            return;
        }

        setOutput("Submitting...");

        const payload = {
            problem_id: problem?.id,
            code: code,
            language: language,
            // Send User Info for linking
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            username: user.username || user.fullName || "User"
        };

        try {
            const res = await fetch("/api/submissions/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Submission failed");
            }

            const data = await res.json();
            if (data.status === "Accepted") {
                setOutput("✅ Accepted! All test cases passed.");
                // Refresh submissions list if on that tab
                if (activeTab === "submissions") {
                    // Trigger refetch (hacky but valid: switch tab back and forth or just wait for user)
                    // Better: invalidate validation logic. For now, user can click tab again.
                }
            } else {
                setOutput(`❌ ${data.status}\n${data.output || ""}`);
            }
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading problem...</div>;
    if (!problem) return <div className="p-8 text-center text-red-500">Problem not found</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0e0e0e]">
            {/* Gap */}
            <div className="h-4"></div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden px-4 pb-4">
                {/* Left Panel: Problem Description */}
                <div className="w-1/2 flex flex-col border border-gray-700 bg-[#1a1a1a] text-sm rounded-lg overflow-hidden mr-2">
                    {/* Tabs Header */}
                    <div className="flex items-center space-x-1 bg-[#282828] border-b border-gray-700 px-2 h-10">
                        <button
                            onClick={() => setActiveTab("description")}
                            className={`flex items-center space-x-2 px-4 h-full border-b-2 transition-colors ${activeTab === "description" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-white"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Description</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("solutions")}
                            className={`flex items-center space-x-2 px-4 h-full border-b-2 transition-colors ${activeTab === "solutions" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-white"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span>Solutions</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("submissions")}
                            className={`flex items-center space-x-2 px-4 h-full border-b-2 transition-colors ${activeTab === "submissions" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-white"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Submissions</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === "description" && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h1 className="text-2xl font-bold text-white">{problem.id}. {problem.title}</h1>
                                </div>

                                <div className="flex items-center space-x-2 mb-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${problem.difficulty === "Easy" ? "bg-green-500/10 text-green-400" :
                                        problem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500" :
                                            "bg-red-500/10 text-red-500"
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                </div>

                                <div className="prose prose-invert prose-sm max-w-none mb-8 text-gray-300">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {problem.description.split("### Constraints")[0]}
                                    </ReactMarkdown>
                                </div>

                                {/* Constraints - Custom styled to match LeetCode */}
                                {problem.constraints && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-bold text-white mb-4">Constraints:</h3>
                                        <ul className="space-y-2 text-white ml-5 list-disc marker:text-gray-500">
                                            {problem.constraints.split('\n').filter(line => line.trim()).map((constraint, idx) => (
                                                <li key={idx} className="pl-1">
                                                    <span className="inline-block bg-[#282828] text-gray-300 rounded-md px-2 py-1 font-mono text-sm border border-gray-700">
                                                        {constraint.replace(/^- /, '')}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "submissions" && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-4">My Submissions</h2>
                                {!user ? (
                                    <div className="text-gray-400 text-center py-8">Please sign in to view your submissions.</div>
                                ) : submissions.length === 0 ? (
                                    <div className="text-gray-400 text-center py-8">No submissions yet.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {submissions.map((sub) => (
                                            <div key={sub.id} className="bg-[#282828] rounded-lg overflow-hidden">
                                                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors" onClick={() => {
                                                    const el = document.getElementById(`code-${sub.id}`);
                                                    if (el) el.classList.toggle('hidden');
                                                }}>
                                                    <div>
                                                        <div className={`text-lg font-bold ${sub.status === "Accepted" ? "text-green-500" : "text-red-500"}`}>
                                                            {sub.status}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {new Date(sub.timestamp.endsWith("Z") ? sub.timestamp : sub.timestamp + "Z").toLocaleString()} • {sub.language}
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div id={`code-${sub.id}`} className="hidden border-t border-gray-700 bg-[#1e1e1e] p-3 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre">
                                                    {sub.code}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "solutions" && (
                            <div className="space-y-8">
                                {/* Editorial Text */}
                                {problem.editorial && (
                                    <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {problem.editorial}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {/* Official Solution Code */}
                                {solutionsData?.official ? (
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="text-lg font-bold text-green-400">Official Solution</h3>
                                            <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded border border-green-700">Admin</span>
                                        </div>
                                        <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg p-3 overflow-x-auto">
                                            <pre className="text-sm font-mono text-gray-300 whitespace-pre">{solutionsData.official.code}</pre>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Language: {solutionsData.official.language} • {new Date(solutionsData.official.timestamp.endsWith("Z") ? solutionsData.official.timestamp : solutionsData.official.timestamp + "Z").toLocaleString()}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Community Solutions */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Community Solutions</h3>
                                    {!solutionsData?.community?.length ? (
                                        <div className="text-gray-400 text-center py-8 italic border border-dashed border-gray-700 rounded-lg p-6">
                                            "Official solutions coming soon! / no solution yet be the first to solve this problem and submit ;)"
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {solutionsData.community.map((sol: any) => (
                                                <div key={sol.id} className="bg-[#282828] rounded-lg overflow-hidden border border-gray-700">
                                                    <div
                                                        className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors"
                                                        onClick={() => {
                                                            const el = document.getElementById(`sol-${sol.id}`);
                                                            if (el) el.classList.toggle('hidden');
                                                        }}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                                                {sol.username?.[0]?.toUpperCase() || "U"}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white">
                                                                    {sol.username || "Anonymous"}
                                                                </div>
                                                                <div className="text-xs text-green-400">Accepted</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(sol.timestamp.endsWith("Z") ? sol.timestamp : sol.timestamp + "Z").toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div id={`sol-${sol.id}`} className="hidden border-t border-gray-700 bg-[#1e1e1e] p-3 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre">
                                                        {sol.code}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Logic Area - Kept at bottom */}
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-white">Your Notes</h3>
                                <span className="text-xs text-gray-500">Only visible to you</span>
                            </div>
                            <textarea
                                className="w-full h-32 bg-[#282828] p-3 rounded-lg text-sm text-gray-300 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none transition-colors"
                                placeholder="Write your intuition, approach, or complexity analysis here..."
                            ></textarea>
                        </div>

                        <div className="h-10"></div> {/* Spacer */}
                    </div>
                </div>

                {/* Right Panel: Code Editor */}
                <div className="w-1/2 flex flex-col bg-[#1e1e1e] border border-gray-700 rounded-lg overflow-hidden ml-2">
                    <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700">
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
                        >
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                        </select>
                        <div className="space-x-2">
                            <button
                                onClick={handleRun}
                                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition"
                            >
                                Run Code
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded text-sm transition font-medium"
                            >
                                Submit
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>

                    {/* Output Console (Collapsible ideally, fixed for now) */}
                    <div className="h-32 bg-gray-900 border-t border-gray-700 p-2 font-mono text-sm overflow-y-auto">
                        <div className="text-gray-500 mb-1">Output:</div>
                        <pre>{output}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
