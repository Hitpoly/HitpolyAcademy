import { Variants } from 'framer-motion';

export const FadeInOut = {
    initial: { opacity: 0, y: 0 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
    exit: { opacity: 0 }
};
