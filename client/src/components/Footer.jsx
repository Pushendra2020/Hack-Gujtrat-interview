import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">InterviewAI</h3>
            <p className="text-sm text-gray-300">
              Practice interviews with AI, analyze your resume, and improve your interview skills.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/interview" className="text-sm text-gray-300 hover:text-white">
                  Practice Interview
                </Link>
              </li>
              <li>
                <Link to="/resume" className="text-sm text-gray-300 hover:text-white">
                  Resume Analysis
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-sm text-gray-300">
              Email: support@interviewai.com
              <br />
              Phone: +1 (123) 456-7890
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} InterviewAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 