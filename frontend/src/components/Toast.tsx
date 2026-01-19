import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  isVisible: boolean
  onClose: () => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'border-white/20 bg-white/10',
  error: 'border-white/20 bg-white/10',
  info: 'border-white/20 bg-white/10',
}

const iconStyles = {
  success: 'text-white',
  error: 'text-surface-400',
  info: 'text-surface-300',
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  const Icon = icons[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 sm:bottom-24 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50"
        >
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl',
              styles[type]
            )}
          >
            <Icon className={cn('w-5 h-5 flex-shrink-0', iconStyles[type])} />
            <span className="text-white text-sm font-medium flex-1">{message}</span>
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-surface-500" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
