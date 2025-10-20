import { motion } from "framer-motion";

export const AnimatedLogo = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-48 w-48"
        >
            <motion.svg
                width="234"
                height="226"
                viewBox="0 0 234 226"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                animate={{
                    rotate: [0, 5, 0, -5, 0],
                    y: [0, -10, 0, -5, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            >
                <mask
                    id="mask0_1_63"
                    style={{ maskType: "alpha" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="234"
                    height="226"
                >
                    <rect x="121" width="113" height="129" fill="#000000" />
                    <rect width="113" height="87" fill="#000000" />
                    <rect y="97" width="113" height="129" fill="#000000" />
                    <rect
                        x="121"
                        y="139"
                        width="113"
                        height="87"
                        fill="#000000"
                    />
                </mask>
                <motion.g
                    mask="url(#mask0_1_63)"
                    animate={{
                        scale: [1, 1.05, 1, 0.95, 1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                >
                    <motion.circle
                        cx="117"
                        cy="113"
                        r="86"
                        className="fill-black"
                        initial={{ opacity: 0.7 }}
                        animate={{
                            opacity: [0.7, 1, 0.7],
                            fill: ["#000000", "#000000", "#000000"],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    />
                </motion.g>
            </motion.svg>

            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-black/30"
                    style={{
                        width: Math.random() * 8 + 4 + "px",
                        height: Math.random() * 8 + 4 + "px",
                        left: `calc(50% + ${Math.cos((i * Math.PI) / 4) * 120}px)`,
                        top: `calc(50% + ${Math.sin((i * Math.PI) / 4) * 120}px)`,
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0],
                        x: [0, Math.cos((i * Math.PI) / 4) * 20],
                        y: [0, Math.sin((i * Math.PI) / 4) * 20],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: Math.random() * 2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </motion.div>
    );
};
