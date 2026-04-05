// file: blueprints.js

/**
 * SKYLINE AA-1 - WEEK 22
 * The Blueprint Library: Pre-defined logic templates for common intents.
 * This ensures that "Login" always has the same high-quality rules.
 */

const BLUEPRINTS = {
    // 🟢 LOGIN INTENT
    LOGIN: {
        description: "Standard Login Validation",
        rules: [
            { subject: "email", operator: "EXISTS", value: true, dataType: "BOOLEAN" },
            { subject: "password", operator: "EXISTS", value: true, dataType: "BOOLEAN" }
        ]
    },

    // 🔵 SIGNUP / REGISTER INTENT
    SIGNUP: {
        description: "Standard Registration Validation",
        rules: [
            { subject: "email", operator: "EXISTS", value: true, dataType: "BOOLEAN" },
            { subject: "password", operator: "GTE", value: 8, dataType: "NUMBER" }, // Min length 8
            { subject: "age", operator: "GTE", value: 18, dataType: "NUMBER" }      // Must be adult
        ]
    },

    // 🟡 PASSWORD RESET INTENT
    RESET_PASSWORD: {
        description: "Password Reset Request",
        rules: [
            { subject: "email", operator: "EXISTS", value: true, dataType: "BOOLEAN" }
        ]
    },

    // 🟣 PAYMENT / CHECKOUT INTENT
    PAYMENT: {
        description: "Payment Processing Validation",
        rules: [
            { subject: "cardNumber", operator: "EXISTS", value: true, dataType: "BOOLEAN" },
            { subject: "expiryDate", operator: "EXISTS", value: true, dataType: "BOOLEAN" },
            { subject: "cvv", operator: "GTE", value: 3, dataType: "NUMBER" },       // Min 3 digits
            { subject: "amount", operator: "GREATER_THAN", value: 0, dataType: "NUMBER" }
        ]
    },

    // 🟠 CONTACT FORM INTENT
    CONTACT: {
        description: "Contact Form Validation",
        rules: [
            { subject: "name", operator: "EXISTS", value: true, dataType: "BOOLEAN" },
            { subject: "email", operator: "EXISTS", value: true, dataType: "BOOLEAN" },
            { subject: "message", operator: "GTE", value: 10, dataType: "NUMBER" }   // Min 10 chars
        ]
    }
};

/**
 * Helper to get a blueprint by intent name
 */
function getBlueprint(intentName) {
    const key = intentName.toUpperCase();
    return BLUEPRINTS[key] || null;
}

module.exports = { BLUEPRINTS, getBlueprint };
