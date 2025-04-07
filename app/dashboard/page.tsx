"use client"; // Must be the first line

import { useSession, signOut } from "auth/react";

export default function Dashboard() { // Use PascalCase for component name
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>You are not logged in. Please sign in to continue.</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Welcome, {session.user.email}</h1>
      <h1 className="text-2xl mb-4">Welcome, {session.user.role}</h1>
      <button
        onClick={() => signOut()}
        className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded"
      >
        Sign Out
      </button>
    </div>
  );
}
