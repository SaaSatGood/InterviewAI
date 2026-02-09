// Resume Parser - PDF extraction using pdfjs-dist
// Client-side only, no server upload required

export interface ResumeData {
    fullText: string;
    summary: string;
    fileName: string;
    extractedAt: string;
}

export interface ParseError {
    code: 'INVALID_FILE' | 'EXTRACTION_FAILED' | 'FILE_TOO_LARGE';
    message: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_SUMMARY_CHARS = 3000; // ~750 tokens

/**
 * Dynamically load pdfjs-dist (client-side only)
 */
async function getPdfjs() {
    const pdfjs = await import('pdfjs-dist');
    // Use unpkg CDN which is more reliable for ESM modules
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    return pdfjs;
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
    if (typeof window === 'undefined') {
        throw { code: 'EXTRACTION_FAILED', message: 'PDF extraction only works in browser.' } as ParseError;
    }

    if (file.size > MAX_FILE_SIZE) {
        throw { code: 'FILE_TOO_LARGE', message: 'File is too large. Max 10MB.' } as ParseError;
    }

    if (file.type !== 'application/pdf') {
        throw { code: 'INVALID_FILE', message: 'Only PDF files are supported.' } as ParseError;
    }

    try {
        const pdfjs = await getPdfjs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => ('str' in item ? (item as { str: string }).str : ''))
                .join(' ');
            fullText += pageText + '\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw { code: 'EXTRACTION_FAILED', message: 'Failed to extract text from PDF.' } as ParseError;
    }
}

/**
 * Summarize resume text to fit within token limits
 * Uses basic extraction of key sections
 */
export function summarizeResume(fullText: string): string {
    if (fullText.length <= MAX_SUMMARY_CHARS) {
        return fullText;
    }

    // Extract key sections with patterns
    const sections: string[] = [];

    // Try to find name (usually at the beginning)
    const lines = fullText.split('\n').filter(l => l.trim());
    if (lines.length > 0) {
        sections.push(`Name: ${lines[0].trim()}`);
    }

    // Extract emails
    const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
        sections.push(`Email: ${emailMatch[0]}`);
    }

    // Extract skills section
    const skillsMatch = fullText.match(/(?:skills|technologies|tech stack)[:\s]*([\s\S]*?)(?:\n\n|$)/i);
    if (skillsMatch) {
        sections.push(`Skills: ${skillsMatch[1].slice(0, 500).trim()}`);
    }

    // Extract experience keywords
    const experienceMatch = fullText.match(/(?:experience|work history)[:\s]*([\s\S]*?)(?:\n\n|education|skills|$)/i);
    if (experienceMatch) {
        sections.push(`Experience: ${experienceMatch[1].slice(0, 800).trim()}`);
    }

    // Extract education
    const educationMatch = fullText.match(/(?:education|academic)[:\s]*([\s\S]*?)(?:\n\n|experience|skills|$)/i);
    if (educationMatch) {
        sections.push(`Education: ${educationMatch[1].slice(0, 400).trim()}`);
    }

    const summary = sections.join('\n\n');

    // If structured extraction doesn't work well, just truncate
    if (summary.length < 200) {
        return fullText.slice(0, MAX_SUMMARY_CHARS) + '...';
    }

    return summary.slice(0, MAX_SUMMARY_CHARS);
}

/**
 * Parse a resume file and return structured data
 */
export async function parseResume(file: File): Promise<ResumeData> {
    const fullText = await extractTextFromPDF(file);
    const summary = summarizeResume(fullText);

    return {
        fullText,
        summary,
        fileName: file.name,
        extractedAt: new Date().toISOString(),
    };
}

/**
 * Save resume data to localStorage
 */
export function saveResumeToStorage(data: ResumeData): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('interviewai_resume', JSON.stringify(data));
    }
}

/**
 * Load resume data from localStorage
 */
export function loadResumeFromStorage(): ResumeData | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem('interviewai_resume');
    if (!stored) return null;

    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

/**
 * Clear resume data from localStorage
 */
export function clearResumeFromStorage(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('interviewai_resume');
    }
}
