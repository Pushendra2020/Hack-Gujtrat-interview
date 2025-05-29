import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../utils/api.js';
import {
  UserCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: '',
    bio: '',
    experience: '',
    targetRole: '',
    linkedinUrl: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data } = await getUserProfile();
        
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          profileImage: data.profileImage || '',
          bio: data.bio || '',
          experience: data.experience || '',
          targetRole: data.targetRole || '',
          linkedinUrl: data.linkedinUrl || '',
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      
      const { data } = await updateUserProfile(formData);
      setUser(prevUser => ({
        ...prevUser,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        profileImage: data.profileImage,
      }));
      
      setSuccess('Profile updated successfully');
      setUpdating(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setUpdating(false);
      console.error(err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate that passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // Validate password strength
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setChangingPassword(true);
      
      await changePassword(
        passwordData.currentPassword, 
        passwordData.newPassword
      );
      
      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setChangingPassword(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please try again.');
      setChangingPassword(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Image and Level */}
        <div>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col items-center">
              {formData.profileImage ? (
                <img 
                  src={formData.profileImage} 
                  alt={`${formData.firstName} ${formData.lastName}`} 
                  className="h-32 w-32 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <UserCircleIcon className="h-20 w-20 text-gray-400" />
                </div>
              )}
              
              <h2 className="text-xl font-bold">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-gray-500">{formData.email}</p>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold">Your Progress</h2>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Level</span>
                <span className="text-sm text-primary-600 font-medium">
                  {user?.level || 'Beginner'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${user?.levelProgress || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{user?.levelProgress || 0}%</span>
                <span>Next Level: {(user?.level + 1) || 'Intermediate'}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">XP Points</span>
                <span className="text-sm text-primary-600 font-medium">
                  {user?.xp || 0} XP
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>
                  Total interviews: {user?.stats?.totalInterviews || 0}
                </p>
                <p>
                  Average score: {user?.stats?.averageScore || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Profile Form and Password Change */}
        <div className="lg:col-span-2">
          {/* Profile Form */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <UserCircleIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold">Profile Information</h2>
            </div>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                <p>{success}</p>
              </div>
            )}
            
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  disabled
                  className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed.
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  id="profileImage"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleProfileChange}
                  placeholder="https://example.com/your-image.jpg"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleProfileChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us about yourself"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Experience</option>
                    <option value="student">Student</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior (6+ years)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    id="targetRole"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleProfileChange}
                    placeholder="e.g., Frontend Developer"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleProfileChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
          
          {/* Password Change */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <KeyIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold">Change Password</h2>
            </div>
            
            {passwordError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{passwordError}</p>
              </div>
            )}
            
            {passwordSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                <p>{passwordSuccess}</p>
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400"
                disabled={changingPassword}
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
            
            <div className="flex items-center mt-6">
              <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-2" />
              <p className="text-xs text-gray-500">
                Your password is stored securely and never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 