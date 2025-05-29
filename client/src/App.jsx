import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InterviewPage from './pages/InterviewPage';
import FeedbackPage from './pages/FeedbackPage';
import ResumePage from './pages/ResumePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header user={user} setUser={setUser} />
        <main className="flex-grow container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-xl">Loading...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage setUser={setUser} />} />
              <Route path="/register" element={<RegisterPage setUser={setUser} />} />
              <Route path="/dashboard" element={
                <ProtectedRoute user={user}>
                  <DashboardPage user={user} />
                </ProtectedRoute>
              } />
              <Route path="/interview/:id?" element={
                <ProtectedRoute user={user}>
                  <InterviewPage user={user} />
                </ProtectedRoute>
              } />
              <Route path="/feedback/:id" element={
                <ProtectedRoute user={user}>
                  <FeedbackPage user={user} />
                </ProtectedRoute>
              } />
              <Route path="/resume" element={
                <ProtectedRoute user={user}>
                  <ResumePage user={user} />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute user={user}>
                  <ProfilePage user={user} setUser={setUser} />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
