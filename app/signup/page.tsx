"use client";

import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/app/actions/userActions";
import { useSession } from "next-auth/react";

type FormValues = {
  username: string;
  email: string;
  password: string;
  role: "Admin" | "Super User" | "User";
};

export default function SignUpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("role", data.role);

        await createUser(formData);
        router.push("/signin");
      } catch (error) {
        console.error("Error creating user:", error);
      }
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900">🔒 Unauthorized Access</h2>
          <p className="text-gray-600 mt-4">
            You need to be signed in to access this page.
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  if (session.user.role !== "Admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl">⛔</div>
          <h2 className="text-3xl font-bold text-gray-900">Administrator Required</h2>
          <p className="text-gray-600 mt-4">
            Only users with Administrator privileges can create new accounts.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Create an Account</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Username Field */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            {...register("username", { required: "Username is required" })}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
          {errors.username && (
            <p style={{ color: "red" }}>{errors.username.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
          {errors.email && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
          {errors.password && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>

        {/* Role Select */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="role">Role:</label>
          <select
            {...register("role", { required: "Role is required" })}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          >
            <option value="">Select a role</option>
            <option value="Admin">Admin</option>
            <option value="Super User">Super User</option>
            <option value="User">User</option>
          </select>
          {errors.role && (
            <p style={{ color: "red" }}>{errors.role.message}</p>
          )}
        </div>

        <button type="submit" disabled={isPending}>
          {isPending ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
