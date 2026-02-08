# 🏗️ Architecture Overview

## High-Level Design

InterviewAI is a **Client-Side First** application. It relies heavily on the browser's capabilities to maintain state and interact with external APIs (OpenAI), ensuring user data privacy and reducing backend conceptual overhead.

### Key Decisions
- **Next.js App Router**: For modern routing and server component capabilities where needed (though most logic is client-side).
- **Zustand**: For global state management (API Key, User Profile, Session State). Simpler than Redux, more powerful than Context.
- **LocalStorage**: Used to persist sensitive data (API Key) on the user's device only. The key is never transmitted to our servers.

## Data Flow

1. **Initialization**:
   - App checks `localStorage` for API Key.
   - If missing -> `ConfigModal` is shown.
   - If present -> App loads.

2. **Session Setup**:
   - User selects `Position`, `Stack`, `Difficulty`.
   - `useAppStore` updates `userProfile`.

3. **Interview Loop**:
   - `ChatInterface` mounts `useInterview` hook.
   - `useInterview` initializes conversation with a system prompt dynamically generated based on `userProfile`.
   - User inputs message -> `sendChatRequest` (OpenAI API) -> Response added to `messages` state.

4. **Evaluation**:
   - User clicks "Finish Interview".
   - `finishInterview` calls `generateReport` with full conversation history.
   - OpenAI returns JSON structered report.
   - App switches view to `InterviewReport`.

## Directory Structure

- `src/app`: Page routes and layouts.
- `src/components`: Reusable UI components.
  - `ui/`: Primitives (Button, Input).
- `src/hooks`: Logic encapsulation (e.g., `useInterview`).
- `src/lib`:
  - `store.ts`: Zustand store definition.
  - `openai.ts`: API client.
  - `prompts.ts`: Prompt engineering logic.
