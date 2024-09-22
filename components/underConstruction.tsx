"use client";

import { Loader } from 'lucide-react';
import React, { useEffect } from 'react';

export const UnderConstruction = () => {
    return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-blue-500 to-purple-500">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <Loader className="w-16 h-16 text-white animate-spin" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    Page Under Construction
                </h1>
                <p className="text-lg text-gray-200 mb-8">
                    We are working hard to get this page ready. Stay tuned!
                </p>
                <a href="/" className="px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition">
                    Go Back to Home
                </a>
            </div>
        </div>
    );
};