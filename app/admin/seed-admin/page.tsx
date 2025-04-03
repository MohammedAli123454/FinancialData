'use client';

import React, { useState } from 'react';
import { seedAdmin } from "@/app/actions/seedAdmin"

export default function SeedAdminPage() {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    setLoading(true);
    try {
      // Call the server action. In Next.js 13 you can call server actions directly.
      const response = await seedAdmin();
      setResult(response);
    } catch (error) {
      setResult({ success: false, message: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Seed Admin User</h1>
      <button
        onClick={handleSeed}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Seeding...' : 'Run Admin Seed'}
      </button>
      {result && (
        <p className={`mt-4 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
