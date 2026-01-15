import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly to us when you create an account, update your profile,
          or communicate with us. This may include your name, email address, and other contact information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to provide, maintain, and improve our services, to develop new ones,
          and to protect our company and our users.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
        <p className="mb-4">
          We do not share your personal information with companies, organizations, or individuals outside of
          Alinnia except in the following cases: with your consent, for legal reasons, or for external processing.
        </p>
      </div>
    </div>
  );
}
