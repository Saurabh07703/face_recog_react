import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScanFace, UserPlus, Home, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const Navbar = () => {
    const location = useLocation();

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className="relative group">
                <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200",
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                )}>
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                    {isActive && (
                        <motion.div
                            layoutId="navbar-indicator"
                            className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                </div>
            </Link>
        );
    };

    return (
        <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
                        <ScanFace size={32} />
                        <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">FaceAuth</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <NavItem to="/" icon={Home} label="Home" />
                        <NavItem to="/register" icon={UserPlus} label="Register" />
                        <NavItem to="/match" icon={ScanFace} label="Match" />
                        <NavItem to="/manage" icon={Settings} label="Manage" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
