import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { startInterview, getInterviewById, submitAnswer, generateFeedback } from '../utils/api';
import { MicrophoneIcon, PaperAirplaneIcon, PauseIcon } from '@heroicons/react/24/solid';

const InterviewPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  
  // Mock audio recording functionality
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // If an interview ID is provided, fetch the existing interview
    if (id) {
      fetchInterview(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchInterview = async (interviewId) => {
    try {
      setLoading(true);
      const { data } = await getInterviewById(interviewId);
      setSession(data);
      setCurrentQuestionIndex(0); // Start from the first question
      setLoading(false);
    } catch (err) {
      setError('Failed to load interview. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    
    if (!role.trim()) {
      setError('Please enter a job role');
      return;
    }
    
    try {
      setLoading(true);
      const { data } = await startInterview(role, jobDescription);
      setSession(data);
      setCurrentQuestionIndex(0);
      setLoading(false);
    } catch (err) {
      setError('Failed to start interview. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Mock transcription (in a real app, you would send the audio to ScribeBuddy API)
        mockTranscribeAudio();
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Failed to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Mock transcription service (would use ScribeBuddy API in production)
  const mockTranscribeAudio = () => {
    // Simulate API delay
    setTimeout(() => {
      const mockResponses = [
        "I have extensive experience with React and Node.js, having built several full-stack applications in my previous role.",
        "My greatest strength is my ability to learn quickly and adapt to new technologies and environments.",
        "I handled a challenging situation by breaking down the problem into smaller parts and addressing each systematically.",
        "I stay updated with industry trends by following tech blogs, participating in online communities, and attending webinars.",
        "In five years, I see myself in a senior or lead role, mentoring junior developers and contributing to architectural decisions."
      ];
      
      const transcribed = mockResponses[currentQuestionIndex] || 
        "I believe my skills and experience make me a good fit for this position.";
      
      setTranscribedText(transcribed);
      setAnswer(transcribed);
    }, 1500);
  };

  const handleSubmitAnswer = async () => {
    if (!session || answer.trim() === '') {
      return;
    }
    
    try {
      setSubmitting(true);
      const { data } = await submitAnswer(
        session._id,
        currentQuestionIndex,
        answer,
        audioUrl
      );
      
      if (data.isLastQuestion) {
        // Generate feedback if this was the last question
        await generateFeedback(session._id);
        navigate(`/feedback/${session._id}`);
      } else {
        setCurrentQuestionIndex(data.nextQuestionIndex);
        setAnswer('');
        setTranscribedText('');
        setAudioUrl('');
      }
      setSubmitting(false);
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      setSubmitting(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    // Show form to start a new interview
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Start Interview</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleStartInterview}>
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                Job Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Frontend Developer, Product Manager"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="jobDescription" className="block text-gray-700 font-medium mb-2">
                Job Description (optional)
              </label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Paste job description to get more targeted questions"
                rows={6}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show the interview questions and answer interface
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-primary-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{session.role} Interview</h1>
            <div className="text-sm font-medium bg-primary-700 px-3 py-1 rounded-full">
              Question {currentQuestionIndex + 1} of {session.questions.length}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Question:</h2>
            <p className="text-gray-800 text-xl p-4 bg-gray-50 rounded-lg">
              {session.questions[currentQuestionIndex]?.text}
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Your Answer:</h2>
            {transcribedText ? (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800">{transcribedText}</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center">
                <p className="text-gray-500">
                  {isRecording 
                    ? "Recording... Speak your answer" 
                    : "Click the microphone button to record your answer"}
                </p>
              </div>
            )}
            
            {audioUrl && (
              <div className="mb-4">
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <MicrophoneIcon className="h-6 w-6" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <PauseIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={handleSubmitAnswer}
              className="flex items-center justify-center w-full py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
              disabled={!answer.trim() || submitting || isRecording}
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
              {!submitting && <PaperAirplaneIcon className="ml-2 h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage; 