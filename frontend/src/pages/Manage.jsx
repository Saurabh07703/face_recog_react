import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, Search, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const Manage = () => {
    const [faces, setFaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const fetchFaces = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${apiUrl}/faces`, { timeout: 10000 });
            setFaces(response.data);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to load faces. Backend might be offline.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaces();
    }, []);

    const handleDelete = async (name) => {
        if (!window.confirm(`Are you sure you want to delete all data for "${name}"?`)) return;

        setDeleting(name);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/delete_face`, { name }, { timeout: 10000 });
            setFaces(faces.filter(f => f.name !== name));
            setStatus({ type: 'success', message: `Successfully deleted ${name}` });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: `Failed to delete ${name}` });
        } finally {
            setDeleting(null);
        }
    };

    const filteredFaces = faces.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white flex items-center gap-3">
                        <Users className="text-primary" size={36} />
                        Database Management
                    </h2>
                    <p className="text-gray-400 mt-2">Manage registered identities and their capture status</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search identities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary w-full md:w-64 transition-all"
                    />
                </div>
            </div>

            {status.message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "p-4 rounded-xl flex items-center gap-3",
                        status.type === 'success' ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"
                    )}
                >
                    {status.type === 'success' ? <UserCheck size={20} /> : <AlertCircle size={20} />}
                    {status.message}
                </motion.div>
            )}

            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <RefreshCw className="text-primary animate-spin" size={40} />
                        <p className="text-gray-400 animate-pulse">Fetching registered faces...</p>
                    </div>
                ) : filteredFaces.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Identity</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Captures</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Orientations</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode='popLayout'>
                                    {filteredFaces.map((face) => (
                                        <motion.tr
                                            key={face.name}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                        {face.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-white">{face.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={cn(
                                                                    "w-2.5 h-2.5 rounded-full border border-black",
                                                                    i < face.count ? "bg-primary" : "bg-white/10"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-500">{face.count}/5</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {face.orientations.map(o => (
                                                        <span key={o} className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                                                            {o}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(face.name)}
                                                    disabled={deleting === face.name}
                                                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                    title="Delete registration"
                                                >
                                                    {deleting === face.name ? <RefreshCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Users className="text-gray-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No identities found</h3>
                        <p className="text-gray-400 max-w-xs">
                            {search ? `No matches for "${search}" in the database.` : "Start by registering a new face in the Register section."}
                        </p>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-primary/20 bg-primary/5">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                        <UserCheck size={18} className="text-primary" />
                        Best Practice
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        For maximum accuracy, ensure users are registered with all 5 orientations (Front, Left, Right, Top, Bottom). This creates a robust 3D-like representation of the face.
                    </p>
                </div>
                <div className="glass-card p-6">
                    <h4 className="font-bold text-white mb-2">Database Stats</h4>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-primary">{faces.length}</span>
                        <span className="text-gray-500 mb-1">Registered Users</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manage;
