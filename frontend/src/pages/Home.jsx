import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Lock } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass-card p-6 hover:bg-white/5 transition-colors"
    >
        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
);

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent"
            >
                Next Gen Face Auth
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-400 max-w-2xl mb-12"
            >
                Secure, fast, and reliable face recognition powered by advanced AI models.
                Experience the future of authentication today.
            </motion.p>

            <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl px-4 mb-16">
                <FeatureCard
                    icon={ShieldCheck}
                    title="Secure Access"
                    description="Enterprise-grade security ensuring only authorized personnel can access sensitive areas."
                    delay={0.3}
                />
                <FeatureCard
                    icon={Zap}
                    title="Lightning Fast"
                    description="Real-time face detection and matching in milliseconds for seamless user experience."
                    delay={0.4}
                />
                <FeatureCard
                    icon={Lock}
                    title="Privacy First"
                    description="Your biometric data is encrypted and stored securely, never shared with third parties."
                    delay={0.5}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4"
            >
                <Link
                    to="/register"
                    className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all hover:scale-105"
                >
                    Get Started
                </Link>
                <Link
                    to="/match"
                    className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg backdrop-blur-sm border border-white/10 transition-all hover:scale-105"
                >
                    Try Demo
                </Link>
            </motion.div>
        </div>
    );
};

export default Home;
