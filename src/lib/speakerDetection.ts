// Speaker Detection — Heuristic-based diarization using volume levels

export type Speaker = 'recruiter' | 'candidate' | 'unknown' | 'overlap';

interface VolumeSnapshot {
    micVolume: number;
    systemVolume: number;
    timestamp: number;
}

const MIC_THRESHOLD = 0.02;      // Minimum mic volume to consider "speaking"
const SYSTEM_THRESHOLD = 0.02;   // Minimum system volume to consider "speaking"

/**
 * Detect who is currently speaking based on volume levels
 * - In "call" mode: mic = candidate, system = recruiter
 * - In "presential" mode: uses baseline calibration
 */
export function detectSpeaker(
    micVolume: number,
    systemVolume: number,
    mode: 'call' | 'presential'
): Speaker {
    if (mode === 'call') {
        const micActive = micVolume > MIC_THRESHOLD;
        const sysActive = systemVolume > SYSTEM_THRESHOLD;

        if (micActive && sysActive) return 'overlap';
        if (micActive) return 'candidate';
        if (sysActive) return 'recruiter';
        return 'unknown';
    }

    // Presential mode — only mic available, can't distinguish
    if (micVolume > MIC_THRESHOLD) return 'unknown';
    return 'unknown';
}

/**
 * Smooth speaker detection with a sliding window to avoid flickering
 */
export class SpeakerTracker {
    private history: VolumeSnapshot[] = [];
    private windowMs: number;
    private mode: 'call' | 'presential';

    constructor(mode: 'call' | 'presential', windowMs = 500) {
        this.mode = mode;
        this.windowMs = windowMs;
    }

    push(micVolume: number, systemVolume: number): Speaker {
        const now = Date.now();
        this.history.push({ micVolume, systemVolume, timestamp: now });

        // Remove old entries
        this.history = this.history.filter(s => now - s.timestamp < this.windowMs);

        // Average over window
        const avgMic = this.history.reduce((s, v) => s + v.micVolume, 0) / this.history.length;
        const avgSys = this.history.reduce((s, v) => s + v.systemVolume, 0) / this.history.length;

        return detectSpeaker(avgMic, avgSys, this.mode);
    }

    setMode(mode: 'call' | 'presential') {
        this.mode = mode;
    }

    reset() {
        this.history = [];
    }
}
