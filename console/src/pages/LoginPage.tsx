import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { createDeviceUuid, requestOtp } from "../store/slices/authSlice";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, deviceUuid, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const initDevice = async () => {
      if (!deviceUuid) {
        await dispatch(
          createDeviceUuid({
            fcmToken: "dummy-token",
            deviceType: "web",
            osName: navigator.platform,
            osVersion: navigator.userAgent,
            deviceModel: "browser",
            isPhysicalDevice: true,
            appVersion: "1.0.0",
          })
        );
      }
    };
    initDevice();
  }, [dispatch, deviceUuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceUuid) {
      await dispatch(requestOtp({ email, deviceUuid }));
      navigate("/verify-otp");
    }
  };

  return (
    <div className="lg:min-h-[90vh] lg:flex max-lg:flex-col">
      {/* Left Panel - Illustration (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
        <div className="relative">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="p-8">
            <div className="text-white space-y-6">
              <h1 className="text-4xl font-bold">Welcome to React Builder</h1>
              <p className="text-xl text-gray-400">
                Build and deploy your React applications with ease.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className=" w-full lg:w-1/2 flex lg:flex-col items-center justify-center px-2 sm:px-6 lg:px-8 bg-black text-white max-lg:rounded-md">
        <div className="w-full lg:max-w-md lg:space-y-8 max-lg:p-4 max-lg:my-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              {/* Logo */}
              <svg
                className="h-12 w-12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 19.7778H22L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Log in to your account to continue
            </p>
          </div>

          <div className="mt-8">
            <div className="bg-zinc-900 rounded-lg p-8 shadow-xl border border-zinc-800">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="text-start block text-sm font-medium text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 bg-zinc-800 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                    {loading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Requesting OTP...
                      </div>
                    ) : (
                      "Continue with Email"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="font-medium text-blue-500 hover:text-blue-400">
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-medium text-blue-500 hover:text-blue-400">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
