/**
 * Minimal logger stub. RishiVerse uses a richer context logger;
 * keep the same call shape: createContextLogger(name).info/warn/error/debug
 */
export default function createContextLogger(context) {
    const prefix = `[${context}]`;
    return {
        debug: (message, meta) => console.debug(prefix, message, meta ?? ""),
        info: (message, meta) => console.info(prefix, message, meta ?? ""),
        warn: (message, meta) => console.warn(prefix, message, meta ?? ""),
        error: (message, meta) => console.error(prefix, message, meta ?? ""),
    };
}
