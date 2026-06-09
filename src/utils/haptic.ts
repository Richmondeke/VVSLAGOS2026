export const triggerHaptic = (type: "light" | "medium" | "success") => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try {
            if (type === "light") navigator.vibrate(15);
            else if (type === "medium") navigator.vibrate(30);
            else if (type === "success") navigator.vibrate([40, 40, 40]);
        } catch (e) {
            console.warn("Haptic feedback not supported or blocked by browser:", e);
        }
    }
};
