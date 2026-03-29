import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate?: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐱</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Cat Emotion Detector
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              <button
                onClick={() => onNavigate?.('upload')}
                className="
                  text-gray-700 dark:text-gray-300 hover:text-gray-900
                  dark:hover:text-gray-50 font-medium transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1
                "
              >
                Analyze
              </button>
              <button
                onClick={() => onNavigate?.('annotate')}
                className="
                  text-gray-700 dark:text-gray-300 hover:text-gray-900
                  dark:hover:text-gray-50 font-medium transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1
                "
              >
                📸 Annotate Data
              </button>
              <a
                href="/history"
                className="
                  text-gray-700 dark:text-gray-300 hover:text-gray-900
                  dark:hover:text-gray-50 font-medium transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1
                "
              >
                History
              </a>
              <a
                href="/privacy"
                className="
                  text-gray-700 dark:text-gray-300 hover:text-gray-900
                  dark:hover:text-gray-50 font-medium transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1
                "
              >
                Privacy
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="
                md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none
                focus:ring-2 focus:ring-blue-500
              "
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              <button
                onClick={() => {
                  onNavigate?.('upload');
                  setMobileMenuOpen(false);
                }}
                className="
                  block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                  transition-colors
                "
              >
                Analyze
              </button>
              <button
                onClick={() => {
                  onNavigate?.('annotate');
                  setMobileMenuOpen(false);
                }}
                className="
                  block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                  transition-colors
                "
              >
                📸 Annotate Data
              </button>
              <a
                href="/history"
                className="
                  block px-4 py-2 text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                  transition-colors
                "
              >
                History
              </a>
              <a
                href="/privacy"
                className="
                  block px-4 py-2 text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                  transition-colors
                "
              >
                Privacy
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-4">
                About
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cat Emotion Detector helps you understand your cat's emotions through AI-powered analysis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/privacy"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Contact
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Have questions? We'd love to hear from you.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 Cat Emotion Detector. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
