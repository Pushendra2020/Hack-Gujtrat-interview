# InterviewAI Frontend

This is the frontend for the InterviewAI application, built with React, Vite, and TailwindCSS.

## Features

- User authentication (login/register)
- AI-powered interview practice
- Resume analysis and ATS scoring
- Performance tracking and gamification
- PDF report generation

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```
npm run dev
```

## Build for Production

```
npm run build
```

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components
- `src/context`: React context providers
- `src/hooks`: Custom React hooks
- `src/utils`: Utility functions and API services
- `src/assets`: Static assets like images and icons
