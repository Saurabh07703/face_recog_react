import React, { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user"
};

const WebcamCapture = forwardRef(({ onCapture, isScanning = false }, ref) => {
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImage(imageSrc);
            onCapture(imageSrc); // Pass directly
        }
    }, [webcamRef, onCapture]);

    useImperativeHandle(ref, () => ({
        captureNow: () => {
            capture();
        },
        retake: () => {
            setImage(null);
            onCapture(null);
        }
    }));

    const retake = () => {
        setImage(null);
        onCapture(null);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            {!image ? (
                <div className="relative">
                    <Webcam
                        audio={false}
                        height={480}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={720}
                        videoConstraints={videoConstraints}
                        className="w-full h-auto"
                    />
                    {isScanning && (
                        <motion.div
                            className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_15px_rgba(124,58,237,0.8)] z-10"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                    )}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                        <button
                            onClick={(e) => { e.preventDefault(); capture(); }}
                            className="group relative flex items-center justify-center p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 rounded-full border-2 border-primary/50 group-hover:border-primary opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-slow" />
                            <Camera size={32} className="text-white relative z-10" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <img src={image} alt="Captured" className="w-full h-auto" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                        <button
                            onClick={retake}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105"
                        >
                            <RefreshCcw size={20} />
                            <span>Retake</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default WebcamCapture;
