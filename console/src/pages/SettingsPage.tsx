import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const SettingsPage = () => {
  const { email } = useSelector((state: RootState) => state.auth);

  return (
    <div className="lg:ml-10 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-sm sm:text-base text-zinc-400">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-black/40 backdrop-blur-md rounded-lg border border-zinc-800 divide-y divide-zinc-800">
        {/* Profile Settings */}
        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-white">Profile Settings</h2>
              <p className="mt-1 text-sm text-zinc-400">Update your account information.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className='text-start'>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email || ''}
                  disabled
                  className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2"
                />
                <p className="mt-2 text-xs text-zinc-500">Your email address is used for authentication.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="p-4 sm:p-6">
          <div className="space-y-6 text-start">
            <div>
              <h2 className="text-lg font-medium text-white">Preferences</h2>
              <p className="mt-1 text-sm text-zinc-400">Customize your experience.</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-white">Email Notifications</h3>
                  <p className="mt-1 text-sm text-zinc-400">Receive email notifications about your builds.</p>
                </div>
                <div className="mt-2 sm:mt-0 sm:ml-4">
                  <button
                    type="button"
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-zinc-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  >
                    <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-white">Build Notifications</h3>
                  <p className="mt-1 text-sm text-zinc-400">Get notified when builds complete or fail.</p>
                </div>
                <div className="mt-2 sm:mt-0 sm:ml-4">
                  <button
                    type="button"
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-zinc-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  >
                    <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-red-500">Danger Zone</h2>
              <p className="mt-1 text-sm text-zinc-400">Irreversible and destructive actions.</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-start">
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-white">Delete Account</h3>
                  <p className="mt-1 text-sm text-zinc-400">Permanently delete your account and all associated data.</p>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <button className="w-full sm:w-auto px-4 py-2 bg-red-600/10 text-red-500 rounded-md hover:bg-red-600/20 transition-colors duration-200 text-sm font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 