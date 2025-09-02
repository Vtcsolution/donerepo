import React from "react";
import { MdErrorOutline } from "react-icons/md";
import { motion } from "framer-motion";

export default function PageNotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
    >
      <MdErrorOutline className="text-yellow-600" size={100} />
      <h1 className="mt-6 text-3xl font-bold text-gray-900">404 - Page Not Found</h1>
      <p className="mt-2 text-lg text-gray-700 max-w-md text-center">
        The page you’re looking for doesn’t exist.
      </p>
    </motion.div>
  );
}
