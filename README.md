<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<h1 align="center">Synapse</h1>
<p align="center"><strong>Study Smarter with AI Power</strong></p>

Synapse is an intelligent, AI-driven study platform designed to eliminate the struggles of modern learning. It seamlessly generates quizzes, summarizes complex notes, tracks your academic performance, and builds personalized study plans using the Gemini AI.

## ✨ Features

- **AI Quiz Maker:** Generate interactive quizzes instantly from your notes via advanced AI analysis.
- **Notes Summarizer:** Paste your notes and let Synapse extract the key concepts, definitions, and high-yield summaries you actually need.
- **Exam Prep Planner:** Stop cramming. Synapse intelligently creates personalized and adaptive study schedules to keep you on track.
- **Student Dashboard:** Stay organized with built-in tools like a GPA Calculator, custom Timetable builder (with Image-to-Schedule AI features), Pomodoro Timer, and Study Streak tracking.

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, Three.js
- **Backend / Auth:** Firebase (Authentication, Firestore Database)
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Data Visualization:** Recharts, Lucide React

## 💻 Getting Started

Follow these instructions to run Synapse locally on your machine.

### Prerequisites

- Node.js installed on your machine
- A Google Gemini API Key 

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adityaacharya7/synapse.git
   cd synapse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root of your project and set your Gemini API key (and optionally your Firebase configuration metrics):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to the localhost link provided by Vite (typically `http://localhost:5173`) to view the application.

## 👥 Contributing

Feel free to open an issue or submit a pull request if you have ideas on how to make Synapse even better!
