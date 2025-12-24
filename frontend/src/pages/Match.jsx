import React, { useState } from 'react';
import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, Check, X, UserCheck } from 'lucide-react';
import { cn } from '../lib/utils';

const Match = () => {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCapture = async (imgSrc) => {
        setImage(imgSrc);
        if (!imgSrc) {
            setResult(null);
            setError('');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/match`, {
                image: imgSrc
            });

            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Matching failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-white mb-2">Face Verification</h2>
                    <p className="text-gray-400">Position your face in the frame to verify identity</p>
                </div>

                <div className="glass-card p-4 relative">
                    <WebcamCapture onCapture={handleCapture} isScanning={loading} />

                    <AnimatePresence>
                        {(result || error) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={cn(
                                    "absolute inset-x-4 bottom-4 p-4 rounded-xl backdrop-blur-xl border shadow-2xl flex items-center justify-between",
                                    error ? "bg-red-500/20 border-red-500/30" :
                                        (result?.is_match ? "bg-green-500/20 border-green-500/30" : "bg-yellow-500/20 border-yellow-500/30")
                                )}
                            >
                                {error ? (
                                    <div className="flex items-center gap-3 text-red-200">
                                        <X className="text-red-400" size={24} />
                                        <div>
                                            <h4 className="font-bold">Error</h4>
                                            <p className="text-sm opacity-80">{error}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 text-white w-full">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center",
                                            result?.is_match ? "bg-green-500" : "bg-yellow-500"
                                        )}>
                                            {result?.is_match ? <UserCheck size={24} /> : <ScanFace size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">
                                                {result?.is_match ? "Identity Verified" : "Unknown Identity"}
                                            </h3>
                                            <p className="text-sm opacity-80">
                                                {result?.is_match ? `Matched: ${result.matched_name}` : "No match found in database"}
                                            </p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <div className="text-xs uppercase tracking-wider opacity-60">Confidence</div>
                                            <div className="font-mono text-xl font-bold">
                                                {(result?.similarity_score * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Match;
