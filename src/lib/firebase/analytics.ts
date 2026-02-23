import { logEvent } from 'firebase/analytics';
import { analytics } from './config';

// List of standard events for InterviewAI / SalesAI
type EventName =
    | 'login'
    | 'sign_up'
    | 'start_live_coach'
    | 'end_live_coach'
    | 'insight_generated'
    | 'insight_viewed'
    | 'api_key_added'
    | 'start_interview'
    | 'end_interview'
    | 'generate_report'
    | 'view_report'
    | 'change_mode'
    | 'error_encountered';

/**
 * Log a custom event to Firebase Analytics
 * @param eventName The standardized name of the event
 * @param eventParams Optional key-value pairs with extra info
 */
export const trackEvent = (eventName: EventName, eventParams?: Record<string, any>) => {
    try {
        if (analytics) {
            logEvent(analytics, eventName as string, eventParams);
            // In development, you might want to log this to console or a debug tool
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Analytics] Tracked: ${eventName}`, eventParams || '');
            }
        } else {
            // Analytics not initialized (e.g., SSR or adblocker)
            if (process.env.NODE_ENV === 'development') {
                console.warn(`[Analytics] Skipped (not initialized): ${eventName}`, eventParams || '');
            }
        }
    } catch (error) {
        console.error(`[Analytics] Error tracking ${eventName}:`, error);
    }
};
