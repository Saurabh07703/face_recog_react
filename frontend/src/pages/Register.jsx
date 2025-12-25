import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Compass, Save, CheckCircle, AlertCircle, Info, Play, Square } from 'lucide-react';
import { cn } from '../lib/utils';

const INSTRUCTIONS = {
    front: "Look directly at the camera",
    left: "Turn your head slightly to the LEFT",
    right: "Turn your head slightly to the RIGHT",
    top: "Tilt your head slightly UP",
    bottom: "Tilt your head slightly DOWN"
};

const ORIENTATION_ORDER = ['front', 'left', 'right', 'top', 'bottom'];

const Register = () => {
    const [name, setName] = useState('');
    const [orientation, setOrientation] = useState('front');
    const [image, setImage] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    // Auto-capture state
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);
    const [autoStep, setAutoStep] = useState(0);
    const [countdown, setCountdown] = useState(null);
    const webcamRef = useRef(null);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        // Only speak on manual change or if not in critical auto-capture phase
        if (!isAutoCapturing) {
            const text = INSTRUCTIONS[orientation];
            if (text) speak(text);
        }
    }, [orientation]);

    // Auto Capture Sequence Logic
    useEffect(() => {
        let timer;
        if (isAutoCapturing && autoStep < ORIENTATION_ORDER.length) {
            const currentOrientation = ORIENTATION_ORDER[autoStep];
            setOrientation(currentOrientation);

            // Step 1: Speak instruction
            speak(INSTRUCTIONS[currentOrientation] + ". Capturing in 3 seconds.");

            // Step 2: Countdown
            let count = 3;
            setCountdown(count);

            timer = setInterval(() => {
                count--;
                setCountdown(count);
                if (count === 0) {
                    clearInterval(timer);
                    setCountdown(null);
                    // Trigger Capture
                    if (webcamRef.current) {
                        webcamRef.current.captureNow();
                    }
                }
            }, 1000);
        } else if (autoStep >= ORIENTATION_ORDER.length) {
            setIsAutoCapturing(false);
            setStatus({ type: 'success', message: 'All angles captured successfully!' });
        }

        return () => clearInterval(timer);
    }, [isAutoCapturing, autoStep]);

    // Handle Image Capture (Manual or Auto)
    const handleCapture = async (capturedImage) => {
        setImage(capturedImage);

        if (isAutoCapturing && capturedImage) {
            // Auto-submit immediately
            await submitImage(capturedImage, ORIENTATION_ORDER[autoStep]);
            // Clear image to ready for next
            if (webcamRef.current) webcamRef.current.retake();
            // Move to next step
            setAutoStep(prev => prev + 1);
        }
    };

    const submitImage = async (imgData, currentOrientation) => {
        if (!name) {
            setStatus({ type: 'error', message: 'Please enter a name first' });
            setIsAutoCapturing(false);
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: `Uploading ${currentOrientation} face...` });

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
            console.warn("VITE_API_URL is not defined in production environment!");
        }

        try {
            await axios.post(`${apiUrl}/upload`, {
                name,
                orientation: currentOrientation,
                image: imgData,
            }, {
                timeout: 120000 // 120 seconds timeout for large model loading
            });
            // Success for this step
        } catch (error) {
            console.error(error);
            let errorMessage = 'Unknown error';

            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. The backend might be starting up (cold start). Please try again in a minute.';
            } else if (!error.response) {
                if (import.meta.env.PROD && (apiUrl.includes('localhost') || !import.meta.env.VITE_API_URL)) {
                    errorMessage = 'Network Error: API URL is pointing to localhost or is missing. Please set VITE_API_URL in your Vercel project settings.';
                } else {
                    errorMessage = `Network error. Could not connect to the backend at ${apiUrl}. Please check your connection or CORS settings.`;
                }
            } else {
                errorMessage = error.response?.data?.error || error.message || 'Server error';
            }

            setStatus({
                type: 'error',
                message: `Failed ${currentOrientation}: ${errorMessage}`
            });
            setIsAutoCapturing(false); // Stop on error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitImage(image, orientation);
    };

    const startAutoSequence = () => {
        if (!name) {
            setStatus({ type: 'error', message: 'Please enter your name to start' });
            return;
        }
        setIsAutoCapturing(true);
        setAutoStep(0);
        setStatus({ type: '', message: '' });
    };

    const stopAutoSequence = () => {
        setIsAutoCapturing(false);
        setCountdown(null);
        setStatus({ type: 'info', message: 'Auto-capture stopped' });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <User className="text-primary" size={32} />
                        Register New Face
                    </h2>
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full border border-primary/20 text-primary-foreground text-sm font-medium">
                        <Info size={16} />
                        <span>Action: {INSTRUCTIONS[orientation]}</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Enter your name"
                                    disabled={isAutoCapturing}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-400">Orientation</label>
                                <span className="text-xs text-gray-500">{isAutoCapturing ? 'Auto-switching...' : 'Select manually'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {['front', 'left', 'right', 'top', 'bottom'].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => !isAutoCapturing && setOrientation(opt)}
                                        disabled={isAutoCapturing}
                                        className={cn(
                                            "py-2 px-3 rounded-lg border text-sm capitalize transition-all",
                                            orientation === opt
                                                ? "bg-primary border-primary text-white"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10",
                                            isAutoCapturing && orientation !== opt && "opacity-50"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={cn(
                                    "p-4 rounded-lg flex items-center gap-3",
                                    status.type === 'success' ? "bg-green-500/20 text-green-400 border border-green-500/20" :
                                        status.type === 'error' ? "bg-red-500/20 text-red-400 border border-red-500/20" :
                                            "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                                )}
                            >
                                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {status.message}
                            </motion.div>
                        )}

                        <div className="space-y-3">
                            {/* Manual Save Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading || isAutoCapturing}
                                className={cn(
                                    "w-full py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2",
                                    isAutoCapturing ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-white"
                                )}
                            >
                                <Save size={20} />
                                Register Current Face
                            </button>

                            {/* Auto Capture Button */}
                            <button
                                onClick={isAutoCapturing ? stopAutoSequence : startAutoSequence}
                                className={cn(
                                    "w-full py-4 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 border",
                                    isAutoCapturing
                                        ? "bg-red-500/20 border-red-500 hover:bg-red-500/30"
                                        : "bg-emerald-600/20 border-emerald-600 hover:bg-emerald-600/30"
                                )}
                            >
                                {isAutoCapturing ? (
                                    <>
                                        <Square size={20} fill="currentColor" />
                                        Stop Auto Sequence
                                    </>
                                ) : (
                                    <>
                                        <Play size={20} fill="currentColor" />
                                        Start Auto-Capture Sequence
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-400">Capture Photo</label>
                            <motion.div
                                key={orientation}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm font-bold text-primary"
                            >
                                {INSTRUCTIONS[orientation]}
                            </motion.div>
                        </div>

                        <div className="relative w-full">
                            <WebcamCapture ref={webcamRef} onCapture={handleCapture} />

                            <AnimatePresence>
                                {countdown !== null && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 1.5, opacity: 0 }}
                                        key={countdown}
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                                    >
                                        <div className="text-[120px] font-bold text-white drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                                            {countdown}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <p className="text-xs text-gray-500 mt-4 text-center">
                            {isAutoCapturing ? "Please follow the voice instructions. Hands-free mode." : "Make sure your face is clearly visible and well-lit."}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
