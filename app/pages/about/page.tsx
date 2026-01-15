import React from 'react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-4">
          Welcome to Alinnia. We are dedicated to providing the ultimate solutions for your needs.
        </p>
        <p className="mb-4">
          Our mission is to innovate and deliver high-quality services to our users. We believe in transparency,
          efficiency, and user satisfaction above all else.
        </p>
        <p>
          Established with the goal of making a difference, we continue to grow and adapt to the ever-changing
          digital landscape.
        </p>
      </div>
    </div>
  );
}
