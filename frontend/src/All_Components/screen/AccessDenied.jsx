import React from "react";
import { MdBlock } from "react-icons/md";
import { motion } from "framer-motion";

export default function AccessDenied() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
    >
      <MdBlock className="text-red-600" size={100} />
      <h1 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h1>
      <p className="mt-2 text-lg text-gray-700 max-w-md text-center">
        You need to be logged in to view this page.
      </p>
    </motion.div>
  );
}
