"use client";

import { useForm } from "react-hook-form";
import { useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type FormValues = {
  username: string;
  email: string;
  password: string;
  role: "admin" | "Super User" | "User";
};

export default function SignUpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated" && session.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const { error } = await res.json();
          alert(`Error: ${error}`);
          return;
        }

        const user = await res.json();
        console.log("Created user:", user);
        router.push("/signin");
      } catch (error) {
        console.error("Error creating user:", error);
        alert("An unexpected error occurred");
      }
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-8 p-8 border rounded-lg shadow bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Username Field */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 font-medium">
            Username:
          </label>
          <input
            id="username"
            type="text"
            {...register("username", { required: "Username is required" })}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
          {errors.username && <p className="text-red-500 mt-1">{errors.username.message}</p>}
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium">
            Email:
          </label>
          <input
            id="email"
            type="email"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
          {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium">
            Password:
          </label>
          <input
            id="password"
            type="password"
            {...register("password", { 
              required: "Password is required", 
              minLength: { 
                value: 6, 
                message: "Password must be at least 6 characters" 
              }
            })}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
          {errors.password && <p className="text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {/* Role Select */}
        <div className="mb-6">
          <label htmlFor="role" className="block text-gray-700 font-medium">
            Role:
          </label>
          <select
            id="role"
            {...register("role", { required: "Role is required" })}
            className="w-full p-2 mt-1 border border-gray-300 rounded bg-white"
          >
            <option value="">Select a role</option>
            <option value="admin">Admin</option>
            <option value="Super User">Super User</option>
            <option value="User">User</option>
          </select>
          {errors.role && <p className="text-red-500 mt-1">{errors.role.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}