"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const [problems, setProblems] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        difficulty: "Medium",
        input_format: "",
        output_format: "",
        constraints: "",
        editorial: "",
    });

    const [testCases, setTestCases] = useState([
        { input_data: "", expected_output: "", is_hidden: true },
    ]);

    const [message, setMessage] = useState("");

    // Fetch existing problems on load
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await fetch("/api/problems/");
                if (res.ok) {
                    const data = await res.json();
                    setProblems(data);
                }
            } catch (err) {
                console.error("Failed to fetch problems", err);
            }
        };
        fetchProblems();
    }, []);

    if (!isLoaded) return <div>Loading...</div>;

    // Security Check
    const authorizedEmail = "puneethvemuri@gmail.com";
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!user || userEmail !== authorizedEmail) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center p-4">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-gray-400 mb-6">You do not have permission to view this page.</p>

                <button
                    onClick={() => window.location.href = "/"}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm transition"
                >
                    Go Home
                </button>
            </div>
        );
    }

    const handleEditClick = (problem: any) => {
        setEditingId(problem.id);
        setFormData({
            title: problem.title,
            slug: problem.slug,
            description: problem.description,
            difficulty: problem.difficulty,
            input_format: problem.input_format || "",
            output_format: problem.output_format || "",
            constraints: problem.constraints || "",
            editorial: problem.editorial || "",
        });
        // Transform test cases if needed (ensure fields align)
        setTestCases(problem.test_cases.map((tc: any) => ({
            input_data: tc.input_data,
            expected_output: tc.expected_output,
            is_hidden: tc.is_hidden
        })));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMessage(`Editing ${problem.title}...`);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            title: "",
            slug: "",
            description: "",
            difficulty: "Medium",
            input_format: "",
            output_format: "",
            constraints: "",
            editorial: "",
        });
        setTestCases([{ input_data: "", expected_output: "", is_hidden: true }]);
        setMessage("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTestCaseChange = (index: number, field: string, value: string | boolean) => {
        const newTestCases = [...testCases];
        // @ts-ignore
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input_data: "", expected_output: "", is_hidden: true }]);
    };

    const removeTestCase = (index: number) => {
        const newTestCases = testCases.filter((_, i) => i !== index);
        setTestCases(newTestCases);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(editingId ? "Updating..." : "Creating...");

        const payload = {
            ...formData,
            test_cases: testCases,
        };

        const url = editingId ? `/api/problems/${editingId}` : "/api/problems/";
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Operation failed");
            }

            setMessage(editingId ? "Problem updated successfully!" : "Problem created successfully!");

            // Refresh list
            const resList = await fetch("/api/problems/");
            if (resList.ok) {
                const data = await resList.json();
                setProblems(data);
            }

            // Reset form
            handleCancelEdit();
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Existing Problems List */}
            <div className="mb-8 p-4 bg-gray-900 rounded border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Existing Problems</h2>
                <div className="space-y-2">
                    {problems.map(prob => (
                        <div key={prob.id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                            <span>{prob.id}. {prob.title} ({prob.slug})</span>
                            <button
                                onClick={() => handleEditClick(prob)}
                                className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Edit
                            </button>
                        </div>
                    ))}
                    {problems.length === 0 && <p className="text-gray-500">No problems found.</p>}
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Problem" : "Create New Problem"}</h2>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields same as before... */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border p-2 rounded bg-gray-900 border-gray-700"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Slug (Unique URL)</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full border p-2 rounded bg-gray-900 border-gray-700"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description (Markdown)</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border p-2 rounded h-32 bg-gray-900 border-gray-700 font-mono"
                        required
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Difficulty</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="w-full border p-2 rounded bg-gray-900 border-gray-700"
                        >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Input Format</label>
                        <input
                            type="text"
                            name="input_format"
                            value={formData.input_format}
                            onChange={handleChange}
                            className="w-full border p-2 rounded bg-gray-900 border-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Output Format</label>
                        <input
                            type="text"
                            name="output_format"
                            value={formData.output_format}
                            onChange={handleChange}
                            className="w-full border p-2 rounded bg-gray-900 border-gray-700"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Constraints</label>
                    <textarea
                        required
                        className="w-full bg-gray-800 rounded p-2 text-white h-24"
                        value={formData.constraints}
                        onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                        placeholder="- 2 <= nums.length <= 10^4&#10;- -10^9 <= nums[i] <= 10^9"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Editorial / Solution (Markdown)</label>
                    <textarea
                        className="w-full bg-gray-800 rounded p-2 text-white h-48 font-mono"
                        value={formData.editorial}
                        onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
                        placeholder="# Solution Approach&#10;&#10;Use a hash map to store complements..."
                    />
                </div>

                <div className="border border-gray-700 p-4 rounded">
                    <h2 className="text-xl font-semibold mb-2">Test Cases</h2>
                    {testCases.map((tc, index) => (
                        <div key={index} className="mb-4 p-4 bg-gray-800 rounded relative">
                            <button
                                type="button"
                                onClick={() => removeTestCase(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                            >
                                Remove
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase mb-1">Input Data</label>
                                    <textarea
                                        value={tc.input_data}
                                        onChange={(e) => handleTestCaseChange(index, "input_data", e.target.value)}
                                        className="w-full bg-gray-900 p-2 rounded border border-gray-700 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1">Expected Output</label>
                                    <textarea
                                        value={tc.expected_output}
                                        onChange={(e) => handleTestCaseChange(index, "expected_output", e.target.value)}
                                        className="w-full bg-gray-900 p-2 rounded border border-gray-700 font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center">
                                <input
                                    type="checkbox"
                                    checked={tc.is_hidden}
                                    onChange={(e) => handleTestCaseChange(index, "is_hidden", e.target.checked)}
                                    className="mr-2"
                                />
                                <label className="text-sm">Hidden Test Case?</label>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addTestCase}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm"
                    >
                        + Add Test Case
                    </button>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className={`flex-1 font-bold py-3 rounded text-white ${editingId ? "bg-yellow-600 hover:bg-yellow-500" : "bg-green-600 hover:bg-green-500"}`}
                    >
                        {editingId ? "Update Problem" : "Create Problem"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded font-bold"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
