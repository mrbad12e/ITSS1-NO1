// Data sanitization utilities
export const sanitizers = {
    // Recursively trim string values in objects
    trimObject: (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        return Object.keys(obj).reduce((acc, key) => {
            const value = obj[key];
            acc[key] = typeof value === 'string' ? value.trim() 
                    : typeof value === 'object' ? sanitizers.trimObject(value)
                    : value;
            return acc;
        }, {});
    },

    // Query parameter sanitization middleware
    sanitizeQuery: (req, res, next) => {
        req.query = sanitizers.trimObject(req.query);
        next();
    },

    // Request body sanitization middleware
    sanitizeBody: (req, res, next) => {
        req.body = sanitizers.trimObject(req.body);
        next();
    }
};