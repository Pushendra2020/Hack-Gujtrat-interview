import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { uploadResume, getUserResumes, getATSScore } from '../utils/api';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Set up PDF worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ResumePage = ({ user }) => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const { data } = await getUserResumes();
      setResumes(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load resumes. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type
    if (selectedFile.type !== 'application/pdf' && !selectedFile.type.includes('word')) {
      setError('Please upload a PDF or Word document');
      setFile(null);
      setFilePreview(null);
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setFile(null);
      setFilePreview(null);
      return;
    }

    setFile(selectedFile);
    setError('');

    // Generate preview for PDF files
    if (selectedFile.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(selectedFile);
      setFilePreview(fileUrl);
    } else {
      // For non-PDF files (like Word docs), we can't show a preview
      setFilePreview(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploadLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('resume', file);

      const { data } = await uploadResume(formData);
      
      // Refresh resumes list
      await fetchResumes();
      
      // Select the newly uploaded resume
      setSelectedResume(data);
      
      // Clear file input
      setFile(null);
      setFilePreview(null);
      setUploadLoading(false);
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
      setUploadLoading(false);
      console.error(err);
    }
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
  };

  const handleAnalyzeResume = async () => {
    if (!selectedResume || !jobRole.trim()) {
      setError('Please select a resume and enter a job role');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      
      const { data } = await getATSScore(selectedResume._id, jobRole);
      
      // Update the selected resume with analysis results
      setSelectedResume(prev => ({
        ...prev,
        ...data
      }));
      
      // Also update the resume in the resumes list
      setResumes(prevResumes => 
        prevResumes.map(resume => 
          resume._id === selectedResume._id 
            ? { ...resume, ...data } 
            : resume
        )
      );
      
      setAnalyzing(false);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      setAnalyzing(false);
      console.error(err);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Resume Analysis</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Upload Resume</h2>
            
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <CloudArrowUpIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-1">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400">PDF or Word (max 5MB)</p>
                  <input 
                    type="file" 
                    className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400"
                disabled={!file || uploadLoading}
              >
                {uploadLoading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </form>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Your Resumes</h2>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : resumes.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {resumes.map((resume) => (
                  <li key={resume._id} className="py-3">
                    <button
                      onClick={() => handleSelectResume(resume)}
                      className={`w-full text-left flex items-center p-2 rounded-md ${
                        selectedResume?._id === resume._id ? 'bg-primary-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800 truncate">{resume.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {resume.atsScore > 0 && (
                        <span className="ml-auto px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                          {resume.atsScore}%
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No resumes uploaded yet
              </p>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {selectedResume ? (
            <div>
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{selectedResume.fileName}</h2>
                  {selectedResume.atsScore > 0 && (
                    <div className="flex items-center">
                      <span className="text-sm mr-2">ATS Score:</span>
                      <span className={`px-3 py-1 rounded-full text-white font-medium ${
                        selectedResume.atsScore >= 80 ? 'bg-green-600' : 
                        selectedResume.atsScore >= 60 ? 'bg-yellow-600' : 
                        'bg-red-600'
                      }`}>
                        {selectedResume.atsScore}%
                      </span>
                    </div>
                  )}
                </div>
                
                {selectedResume.atsScore > 0 ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Detected</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedResume.skills?.map((skill, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            )) || (
                              <span className="text-gray-500 text-sm">No skills detected</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Keyword Match</h4>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                            <div 
                              className={`h-2.5 rounded-full ${
                                selectedResume.keywordMatch >= 80 ? 'bg-green-500' : 
                                selectedResume.keywordMatch >= 60 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${selectedResume.keywordMatch || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 text-right">
                            {selectedResume.keywordMatch || 0}% match with {selectedResume.comparedJobRole}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Formatting Issues</h3>
                        <ul className="space-y-1">
                          {selectedResume.formattingIssues?.map((issue, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{issue}</span>
                            </li>
                          )) || (
                            <li className="text-gray-500 text-sm">No formatting issues detected</li>
                          )}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Grammar Issues</h3>
                        <ul className="space-y-1">
                          {selectedResume.grammarIssues?.map((issue, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <XMarkIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{issue}</span>
                            </li>
                          )) || (
                            <li className="text-gray-500 text-sm">No grammar issues detected</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Improvement Suggestions</h3>
                      <ul className="space-y-1">
                        {selectedResume.improvementSuggestions?.map((suggestion, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircleIcon className="h-5 w-5 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-gray-700">{suggestion}</span>
                          </li>
                        )) || (
                          <li className="text-gray-500 text-sm">No suggestions available</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-4">
                      Enter a job role to analyze this resume against and get an ATS compatibility score.
                    </p>
                    
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                        placeholder="e.g., Frontend Developer"
                        className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      
                      <button
                        onClick={handleAnalyzeResume}
                        disabled={analyzing || !jobRole.trim()}
                        className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-400"
                      >
                        {analyzing ? 'Analyzing...' : 'Analyze'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* PDF Preview */}
              <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
                <h2 className="text-xl font-bold mb-4">Resume Preview</h2>
                <div className="border rounded-lg overflow-hidden">
                  {selectedResume.fileType === 'pdf' ? (
                    <Document
                      file={selectedResume.fileUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="mx-auto"
                    >
                      <Page pageNumber={1} width={500} />
                      {numPages > 1 && <p className="text-center text-gray-500 mt-2">Page 1 of {numPages}</p>}
                    </Document>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">Preview not available for this file format</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-16 text-center">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-600 mb-2">No Resume Selected</h2>
              <p className="text-gray-500">
                Upload a new resume or select an existing one from the list to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePage; 