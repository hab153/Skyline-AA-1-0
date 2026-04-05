// file: intent-decoder.js

/**
 * SKYLINE AA-1 - WEEK 22
 * The Intent Decoder: Analyzes user text to detect specific intents (Login, Signup, etc.)
 * Uses keyword matching for speed and zero cost.
 */

const { getBlueprint } = require('./blueprints');

class IntentDecoder {
    /**
     * Analyzes text and returns { intent: string, blueprint: object|null }
     */
    static decode(text) {
        const lowerText = text.toLowerCase();

        // 🟢 Detect LOGIN
        if (lowerText.includes('login') || lowerText.includes('signin') || lowerText.includes('sign in')) {
            return { intent: 'LOGIN', blueprint: getBlueprint('LOGIN') };
        }

        // 🔵 Detect SIGNUP
        if (lowerText.includes('signup') || lowerText.includes('sign up') || lowerText.includes('register') || lowerText.includes('create account')) {
            return { intent: 'SIGNUP', blueprint: getBlueprint('SIGNUP') };
        }

        // 🟡 Detect PASSWORD RESET
        if (lowerText.includes('reset password') || lowerText.includes('forgot password')) {
            return { intent: 'RESET_PASSWORD', blueprint: getBlueprint('RESET_PASSWORD') };
        }

        // 🟣 Detect PAYMENT
        if (lowerText.includes('payment') || lowerText.includes('checkout') || lowerText.includes('buy') || lowerText.includes('purchase')) {
            return { intent: 'PAYMENT', blueprint: getBlueprint('PAYMENT') };
        }

        // 🟠 Detect CONTACT
        if (lowerText.includes('contact') || lowerText.includes('message') || lowerText.includes('feedback')) {
            return { intent: 'CONTACT', blueprint: getBlueprint('CONTACT') };
        }

        // ⚪ No Specific Intent Found
        return { intent: 'GENERAL', blueprint: null };
    }
}

module.exports = { IntentDecoder };
