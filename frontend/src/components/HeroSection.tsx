import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
      {/* Subtle gradient orbs - Cursor style with white/gray */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/4 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-white">Your Music,</span>
          <br />
          <span className="text-surface-400">Peerless Quality</span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-surface-500 max-w-2xl mx-auto mb-8 sm:mb-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Experience music like never before. High-quality streaming,
          beautiful interface, and seamless playback.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-surface-500"
        >
          {['High Quality Audio', 'Instant Playback', 'Smart Caching'].map(
            (feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 glass rounded-full"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                <span>{feature}</span>
              </div>
            )
          )}
        </motion.div>
      </div>
    </section>
  )
}
