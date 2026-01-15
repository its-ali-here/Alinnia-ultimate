import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">Please read these terms carefully before using our service.</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using our service, you agree to be bound by these Terms of Service and all applicable
          laws and regulations. If you do not agree with any of these terms, you are prohibited from using or
          accessing this site.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
        <p className="mb-4">
          Permission is granted to temporarily download one copy of the materials (information or software) on
          Alinnia's website for personal, non-commercial transitory viewing only.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Disclaimer</h2>
        <p className="mb-4">
          The materials on Alinnia's website are provided on an 'as is' basis. Alinnia makes no warranties,
          expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
          implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
          of intellectual property or other violation of rights.
        </p>
      </div>
    </div>
  );
}
