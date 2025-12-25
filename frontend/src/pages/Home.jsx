import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Lock, ChevronRight, Github } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index, duration: 0.5 }}
        whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        className="glass-card p-8 group cursor-default"
    >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(124,58,237,0.1)]">
            <Icon size={28} />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm md:text-base">{description}</p>
    </motion.div>
);

const Home = () => {
    return (
        <div className="relative overflow-hidden">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center min-h-[85vh] text-center relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm font-medium text-gray-400"
                >
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Now v2.0 is Live with Firestore Support
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-8xl font-bold mb-8 tracking-tight"
                >
                    <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Identity,</span>
                    <br />
                    <span className="text-primary drop-shadow-[0_0_30px_rgba(124,58,237,0.3)]">Simplified.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed"
                >
                    Secure, lightning-fast face authentication powered by
                    <span className="text-white font-medium"> InceptionResnetV1</span>.
                    Deployed on edge for real-time performance.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <Link
                        to="/register"
                        className="group px-10 py-5 rounded-2xl bg-primary text-white font-bold text-lg shadow-[0_10px_40px_rgba(124,58,237,0.4)] transition-all hover:scale-105 hover:shadow-[0_15px_50px_rgba(124,58,237,0.6)] flex items-center justify-center gap-2"
                    >
                        Get Started
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                    <Link
                        to="/match"
                        className="px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-sm border border-white/10 transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                        Try Demo
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-16 flex items-center gap-8 text-gray-600 grayscale opacity-50"
                >
                    <span className="font-bold flex items-center gap-2"><Lock size={16} />AES-256</span>
                    <span className="font-bold flex items-center gap-2"><Zap size={16} />RT-INFERENCE</span>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="py-24 max-w-6xl mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        index={1}
                        icon={ShieldCheck}
                        title="Secure Access"
                        description="Professional-grade biometric security ensuring only authorized users can gain access."
                    />
                    <FeatureCard
                        index={2}
                        icon={Zap}
                        title="Neural Speed"
                        description="Optimized InceptionResnetV1 models deliver matching results in under 500ms."
                    />
                    <FeatureCard
                        index={3}
                        icon={Lock}
                        title="Privacy Focused"
                        description="We don't store your images. Only encrypted neural embeddings are saved in Firestore."
                    />
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>
        </div>
    );
};

export default Home;
