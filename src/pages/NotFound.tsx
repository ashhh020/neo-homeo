import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-panel p-10 space-y-6 text-center"
        >
          <Link to="/" className="inline-block"><NeoLogo /></Link>
          <div className="text-8xl font-black text-teal-100 select-none">404</div>
          <div>
            <h1 className="text-2xl font-semibold text-teal-950">Page not found</h1>
            <p className="text-sm text-teal-900/65 mt-2">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/"
              className="px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition">
              Go home
            </Link>
            <Link to="/dashboard"
              className="px-6 py-3 rounded-full border border-teal-100 bg-white text-sm font-semibold text-teal-900 hover:bg-teal-50 transition">
              My dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
