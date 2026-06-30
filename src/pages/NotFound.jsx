import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! The page you are looking for does not exist.</p>
      <Link to="/dashboard" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
