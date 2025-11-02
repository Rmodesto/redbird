"use client";

import { ReactNode } from "react";

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="prose prose-gray max-w-none legal-content">{children}</div>
        </div>
      </div>

      <style jsx global>{`
        .legal-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .legal-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .legal-content p {
          color: #4b5563;
          line-height: 1.75;
          margin-bottom: 1rem;
        }

        .legal-content ul,
        .legal-content ol {
          color: #4b5563;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .legal-content li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }

        .legal-content a {
          color: #2563eb;
          text-decoration: underline;
        }

        .legal-content a:hover {
          color: #1d4ed8;
        }

        .legal-content strong {
          font-weight: 600;
          color: #111827;
        }

        .legal-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
      `}</style>
    </div>
  );
}
