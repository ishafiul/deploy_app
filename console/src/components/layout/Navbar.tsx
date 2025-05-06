import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { logout } from "../../store/slices/authSlice";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await dispatch(logout());
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-md border-b border-[#1D1D1D] z-50">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="bg-black/40 backdrop-blur-md p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1D1D1D] transition-colors lg:hidden">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">
              <svg
                className="w-5 h-5 text-black logo-spin-animation"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                />
              </svg>
            </div>
            <span className="text-white font-medium hidden sm:block">
              React Builder
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="bg-black/40 backdrop-blur-md px-3 py-1.5 text-sm text-zinc-300 hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
