import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Save,
  Camera,
  Bell,
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  timeZone: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notifications: {
    email: boolean;
    push: boolean;
    weekly: boolean;
  };
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bio: user?.profile?.bio || '',
      timeZone: user?.profile?.preferences?.timeZone || 'UTC',
      learningStyle: user?.profile?.preferences?.learningStyle || 'visual',
      difficulty: user?.profile?.preferences?.difficulty || 'beginner',
      notifications: {
        email: true,
        push: true,
        weekly: true
      }
    }
  });

  const onSubmit = async (_data: ProfileFormData) => {
    setIsLoading(true);
    try {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and learning preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {user?.profile?.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-indigo-600" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1 capitalize">{user?.role}</p>
              </div>

              {/* Stats */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Time Spent</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatTime(user?.stats?.totalTimeSpent || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Modules Completed</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.stats?.modulesCompleted || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quizzes Completed</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.stats?.quizzesCompleted || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.stats?.averageScore || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.stats?.streakDays || 0} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      disabled={!isEditing}
                      className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      disabled={!isEditing}
                      className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    disabled={!isEditing}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={3}
                    disabled={!isEditing}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Learning Preferences */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Learning Preferences
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Preferred Difficulty
                      </label>
                      <select
                        {...register('difficulty')}
                        disabled={!isEditing}
                        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Learning Style
                      </label>
                      <select
                        {...register('learningStyle')}
                        disabled={!isEditing}
                        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      >
                        <option value="visual">Visual</option>
                        <option value="auditory">Auditory</option>
                        <option value="kinesthetic">Kinesthetic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Time Zone
                      </label>
                      <select
                        {...register('timeZone')}
                        disabled={!isEditing}
                        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="GMT">GMT</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Settings
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates via email</p>
                      </div>
                      <input
                        {...register('notifications.email')}
                        type="checkbox"
                        disabled={!isEditing}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive browser notifications</p>
                      </div>
                      <input
                        {...register('notifications.push')}
                        type="checkbox"
                        disabled={!isEditing}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Weekly Progress Report</p>
                        <p className="text-sm text-gray-500">Get weekly learning summaries</p>
                      </div>
                      <input
                        {...register('notifications.weekly')}
                        type="checkbox"
                        disabled={!isEditing}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 