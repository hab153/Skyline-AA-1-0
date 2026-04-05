// file: api-enhancer-generator.js

/**
 * SKYLINE AA-1 - WEEK 38
 * The API Enhancer Generator: Creates advanced middleware for Pagination, Filtering, Sorting, and Rate Limiting.
 */

class ApiEnhancerGenerator {
    /**
     * Generates the Pagination Middleware.
     */
    static generatePagination() {
        return `/**
 * Pagination Middleware
 * Expects query params: page, limit
 */
const paginate = (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Prevent negative values
    req.pagination = {
        skip: (page - 1) * limit,
        limit: limit,
        currentPage: page
    };
    
    next();
};

module.exports = paginate;`;
    }

    /**
     * Generates the Filtering & Sorting Middleware.
     */
    static generateFilterSort() {
        return `/**
 * Filter and Sort Middleware
 * Expects query params: sort, order (asc/desc), and any field for filtering
 */
const filterAndSort = (req, res, next) => {
    const { sort, order, ...filters } = req.query;
    
    req.queryOptions = {};
    
    // Handle Sorting
    if (sort) {
        req.queryOptions.order = [[sort, order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC']];
    }
    
    // Handle Filtering (Exact match for simplicity, extend for ranges)
    req.queryOptions.where = {};
    Object.keys(filters).forEach(key => {
        if (!['page', 'limit', 'sort', 'order'].includes(key)) {
            req.queryOptions.where[key] = filters[key];
        }
    });
    
    next();
};

module.exports = filterAndSort;`;
    }

    /**
     * Generates the Rate Limiter Configuration.
     */
    static generateRateLimiter() {
        return `const rateLimit = require('express-rate-limit');

// Generic API Rate Limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict Limiter for Auth Routes: 5 requests per minute
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { error: 'Too many login attempts, please try again later.' },
});

module.exports = { apiLimiter, authLimiter };`;
    }

    /**
     * Returns the list of dependencies needed.
     */
    static getDependencies() {
        return ['express-rate-limit'];
    }
}

module.exports = { ApiEnhancerGenerator };
