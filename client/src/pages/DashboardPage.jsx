import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserInterviews, getUserResumes, getUserPerformance } from '../utils/api.js';
import {
  ChartBarIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  ArrowUpCircleIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardPage = ({ user }) => {
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [interviewsRes, resumesRes, performanceRes] = await Promise.all([
          getUserInterviews(),
          getUserResumes(),
          getUserPerformance()
        ]);

        setInterviews(interviewsRes.data);
        setResumes(resumesRes.data);
        setPerformance(performanceRes.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format chart data
  const chartData = {
    labels: performance?.timestamps?.map(date => new Date(date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Interview Scores',
        data: performance?.scores || [],
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Over Time',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <MicrophoneIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Interviews Completed</h2>
              <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Resume Uploads</h2>
              <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Average Score</h2>
              <p className="text-2xl font-bold text-gray-900">
                {performance?.averageScore || 'N/A'}
                {performance?.averageScore && '%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <ArrowUpCircleIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Current Level</h2>
              <p className="text-2xl font-bold text-gray-900">
                {user?.level || performance?.progressLevel || 'Beginner'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Performance Progress</h2>
        {performance?.scores?.length > 0 ? (
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded text-center">
            <p className="text-gray-500">No interview data yet. Complete interviews to see your progress.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/interview"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 flex items-center"
        >
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <MicrophoneIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Practice Interview</h3>
            <p className="text-gray-500">Start a new AI-powered interview session</p>
          </div>
        </Link>

        <Link
          to="/resume"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 flex items-center"
        >
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <DocumentTextIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Resume Analysis</h3>
            <p className="text-gray-500">Upload your resume for ATS scoring</p>
          </div>
        </Link>
      </div>

      {/* Recent Interviews */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Interviews</h2>
        {interviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interviews.map((interview) => (
                  <tr key={interview._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{interview.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {interview.feedback?.overallScore || 'N/A'}
                        {interview.feedback?.overallScore && '%'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/feedback/${interview._id}`}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        View Feedback
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded text-center">
            <p className="text-gray-500">No interviews yet. Start your first interview to see results here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 