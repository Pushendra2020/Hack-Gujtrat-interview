import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInterviewById, generateReport } from '../utils/api';
import { 
  DocumentTextIcon, 
  ArrowPathIcon,
  CheckCircleIcon, 
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const FeedbackPage = ({ user }) => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const { data } = await getInterviewById(id);
        setInterview(data);
        setReportUrl(data.reportUrl || '');
        setLoading(false);
      } catch (err) {
        setError('Failed to load interview feedback. Please try again.');
        setLoading(false);
        console.error(err);
      }
    };

    if (id) {
      fetchInterview();
    }
  }, [id]);

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const { data } = await generateReport(id);
      setReportUrl(data.reportUrl);
      // Update the local interview data with the new report URL
      setInterview(prev => ({
        ...prev,
        reportUrl: data.reportUrl
      }));
      setGeneratingReport(false);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      setGeneratingReport(false);
      console.error(err);
    }
  };

  // Helper function to get a color class based on score
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderScoreBar = (score, label) => {
    let bgColorClass = 'bg-red-500';
    if (score >= 60) bgColorClass = 'bg-yellow-500';
    if (score >= 80) bgColorClass = 'bg-green-500';

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-700">{label}</span>
          <span className={`text-sm font-medium ${getScoreColorClass(score)}`}>{score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${bgColorClass} h-2.5 rounded-full`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error || 'Interview not found.'}</p>
          <Link to="/dashboard" className="mt-4 inline-block text-primary-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { feedback, role, transcript, summary } = interview;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Interview Feedback</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{role} Interview</h2>
              <div className={`text-xl font-bold ${getScoreColorClass(feedback?.overallScore)}`}>
                {feedback?.overallScore || 'N/A'}
                {feedback?.overallScore && '%'}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{summary}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
              {renderScoreBar(feedback?.clarity || 0, 'Clarity')}
              {renderScoreBar(feedback?.confidence || 0, 'Confidence')}
              {renderScoreBar(feedback?.keywordUsage || 0, 'Keyword Usage')}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Emotion Analysis</h3>
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {feedback?.emotion || 'Neutral'}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">Filler Words</span>
                  <span className="text-sm font-medium">
                    {feedback?.fillerWords || 0} occurrences
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium mb-3">Improvement Suggestions</h3>
            <ul className="space-y-2">
              {feedback?.suggestions?.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              )) || (
                <li className="text-gray-500">No suggestions available</li>
              )}
            </ul>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Report</h3>
            {reportUrl ? (
              <div className="flex flex-col items-center">
                <DocumentTextIcon className="h-12 w-12 text-primary-600 mb-2" />
                <a 
                  href={reportUrl} 
                  className="text-primary-600 hover:text-primary-800 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download PDF Report
                </a>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="flex items-center justify-center mx-auto bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-400"
                >
                  {generatingReport ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Generate PDF Report
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Interview Transcript</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          {transcript ? (
            transcript.split('\n\n').map((qa, index) => {
              const [question, answer] = qa.split('\n');
              return (
                <div key={index} className={`mb-6 ${index > 0 ? 'border-t pt-6' : ''}`}>
                  <div className="mb-3">
                    <p className="font-medium text-gray-900">{question}</p>
                  </div>
                  <div className="pl-4 border-l-4 border-gray-200">
                    <p className="text-gray-700">{answer}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">Transcript not available</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Link
          to="/dashboard"
          className="bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
        >
          Back to Dashboard
        </Link>
        
        <Link
          to="/interview"
          className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
        >
          Start New Interview
        </Link>
      </div>
    </div>
  );
};

export default FeedbackPage; 