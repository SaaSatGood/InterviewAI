# InterviewAI - Developer Interview Simulator

InterviewAI is a web-based simulator designed to help developers practice technical, behavioral, and logic interviews. It leverages the user's own OpenAI API key to generate dynamic, context-aware questions and provide detailed feedback.

![Project Banner](https://placeholder.com/banner)

## 🚀 Features

- **Personalized Interviews**: Tailored questions based on Role (Frontend, Backend, Mobile, etc.), Stack (React, Node, Python, etc.), and Difficulty (Junior to Senior).
- **Real-time AI Interaction**: Chat-like interface simulating a professional interviewer.
- **Detailed Evaluation**: comprehensive report with Score, Feedback, Strengths, Weaknesses, and Actionable Suggestions.
- **Secure**: BYOK (Bring Your Own Key) architecture. Your API key is stored locally in your browser and never sent to our servers.
- **Modern UI**: Built with Next.js, Tailwind CSS, and Framer Motion for a premium experience.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI**: OpenAI API

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/interview-ai.git
   cd interview-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Configuration

On first launch, you will be asked to provide your OpenAI API Key.
- This key is stored in `localStorage`.
- You can clear your session or reset the key at any time from the UI.

## 📂 Project Structure

```
/
├── docs/               # Project documentation
├── prompts/            # System prompts for AI
├── questions/          # (Optional) Static question bank
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React Components
│   ├── hooks/          # Custom Hooks (useInterview)
│   ├── lib/            # Utilities (OpenAI client, Store)
│   └── types/          # TypeScript definitions
└── public/             # Static assets
```

## 🤝 Contributing

See [CONTRIBUTING.md](docs/contributing.md) for details on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License.
