export const DashboardPage = () => {
  return (
    <div className="space-y-6 lg:ml-10">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-sm sm:text-base text-zinc-400">Welcome to your React Builder dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Projects */}
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Total Projects</h2>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
              <p className="mt-1 text-sm text-zinc-400">Active projects</p>
            </div>
          </div>
        </div>

        {/* Recent Builds */}
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Recent Builds</h2>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
              <p className="mt-1 text-sm text-zinc-400">Builds this month</p>
            </div>
          </div>
        </div>

        {/* Storage Used */}
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Storage Used</h2>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-bold text-white">0 GB</p>
              <p className="mt-1 text-sm text-zinc-400">Of 10 GB quota</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-zinc-800">
          <div className="p-4 sm:p-6 text-center">
            <svg className="w-12 h-12 mx-auto text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-white">No recent activity</h3>
            <p className="mt-2 text-sm text-zinc-400">Start building your React projects to see activity here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 