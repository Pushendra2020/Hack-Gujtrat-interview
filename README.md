# InterviewAI - AI-Powered Interview Practice Platform

InterviewAI is a comprehensive MERN stack application that helps users practice interviews with AI, analyze their resumes, and improve their interview skills.

## Features

- **AI Interview Practice**: Practice role-specific interviews with AI-generated questions
- **Voice Interaction**: Questions are read aloud using Text-to-Speech, and answers are recorded and transcribed
- **Performance Analysis**: Get detailed feedback on clarity, confidence, filler words, and more
- **Resume Analysis**: Upload your resume and get an ATS compatibility score
- **Performance Dashboard**: Track your progress over time with detailed metrics
- **Gamification**: Earn XP, unlock badges, and level up as you improve
- **PDF Reports**: Generate comprehensive reports of your interview sessions

## Tech Stack

### Frontend
- React + Vite
- TailwindCSS
- React Router
- Chart.js for visualizations
- Firebase/Cloudinary for storage

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- 11Labs API for Text-to-Speech
- ScribeBuddy API for Speech-to-Text
- OpenAI for question generation and feedback

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- API keys for 11Labs, ScribeBuddy, and OpenAI

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/interviewai.git
cd interviewai
```

2. Install backend dependencies
```
cd server
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ELEVENLABS_API_KEY=your_elevenlabs_api_key
SCRIBEBUDDY_API_KEY=your_scribebuddy_api_key
OPENAI_API_KEY=your_openai_api_key
```

4. Install frontend dependencies
```
cd ../client
npm install
```

5. Start the development servers
```
# In the server directory
npm run dev

# In the client directory
npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 