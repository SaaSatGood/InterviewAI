import { db } from './config';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';
import { InterviewReport } from '@/types';

// ==========================================
// USER PROFILES
// ==========================================

export async function getUserProfile(userId: string) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
}

// ==========================================
// LIVE SESSIONS (Live Coach)
// ==========================================

export interface LiveSessionData {
    mode: 'sales' | 'support' | 'interview';
    context: string;
    durationSeconds: number;
    insightsGenerated: number;
    summary?: string;
}

export async function saveLiveSession(userId: string, data: LiveSessionData) {
    try {
        const sessionsRef = collection(db, 'users', userId, 'live_sessions');
        const docRef = await addDoc(sessionsRef, {
            ...data,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving live session:", error);
        throw error;
    }
}

export async function getUserLiveSessions(userId: string) {
    try {
        const sessionsRef = collection(db, 'users', userId, 'live_sessions');
        const q = query(sessionsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching live sessions:", error);
        throw error;
    }
}

// ==========================================
// INTERVIEW REPORTS (Simulator)
// ==========================================

export async function saveInterviewReport(userId: string, report: InterviewReport) {
    try {
        // Use the report ID or generate a new one
        const reportsRef = collection(db, 'users', userId, 'interview_reports');
        const docRef = await addDoc(reportsRef, {
            ...report,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving interview report:", error);
        throw error;
    }
}

export async function getUserInterviewReports(userId: string) {
    try {
        const reportsRef = collection(db, 'users', userId, 'interview_reports');
        const q = query(reportsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching interview reports:", error);
        throw error;
    }
}

// ==========================================
// TOKEN USAGE
// ==========================================

export async function updateUserTokenUsage(userId: string, tokensUsed: number) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        let currentTokens = 0;
        if (userDoc.exists() && userDoc.data().tokensUsed) {
            currentTokens = userDoc.data().tokensUsed;
        }

        await setDoc(userRef, {
            tokensUsed: currentTokens + tokensUsed,
            lastTokenUpdate: serverTimestamp()
        }, { merge: true });

        return currentTokens + tokensUsed;
    } catch (error) {
        console.error("Error updating token usage:", error);
        throw error;
    }
}
