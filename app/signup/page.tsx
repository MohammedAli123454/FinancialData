"use client";

import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
// import { createUser } from "@/app/actions/userActions";
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

  // const onSubmit = async (data: FormValues) => {
  //   startTransition(async () => {
  //     try {
  //       const formData = new FormData();
  //       formData.append("username", data.username);
  //       formData.append("email", data.email);
  //       formData.append("password", data.password);
  //       formData.append("role", data.role);

  //       await createUser(formData);
  //       router.push("/signin");
  //     } catch (error) {
  //       console.error("Error creating user:", error);
  //     }
  //   });
  // };
  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("role", data.role);

        const res = await fetch("/api/users", {
          credentials: 'include',  // Crucial for cookies
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
    
        if (!res.ok) {
          const { error } = await res.json();
          alert("Error: " + error);
          return;
        }
    
        const user = await res.json();
        console.log("Created user:", user);
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
          <p className="text-gray-600 mt-4">You need to be signed in to access this page.</p>
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

  if (session.user.role !== "admin") {
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

  console.log("Client - Session in createUser:", {
    userExists: !!session?.user,
    role: session?.user?.role,
    isAdmin: session?.user?.role === "admin",
  });

  return (
    <div className="max-w-md mx-auto my-8 p-8 border rounded-lg shadow bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Username Field */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 font-medium">Username:</label>
          <input id="username" type="text" {...register("username", { required: "Username is required" })}
            className="w-full p-2 mt-1 border border-gray-300 rounded" />
          {errors.username && <p className="text-red-500 mt-1">{errors.username.message}</p>}
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium">Email:</label>
          <input id="email" type="email" {...register("email", { required: "Email is required" })}
            className="w-full p-2 mt-1 border border-gray-300 rounded" />
          {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium">Password:</label>
          <input id="password" type="password"
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
            className="w-full p-2 mt-1 border border-gray-300 rounded" />
          {errors.password && <p className="text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {/* Role Select */}
        <div className="mb-4">
          <label htmlFor="role" className="block text-gray-700 font-medium">Role:</label>
          <select id="role" {...register("role", { required: "Role is required" })}
            className="w-full p-2 mt-1 border border-gray-300 rounded">
            <option value="">Select a role</option>
            <option value="admin">Admin</option>
            <option value="Super User">Super User</option>
            <option value="User">User</option>
          </select>
          {errors.role && <p className="text-red-500 mt-1">{errors.role.message}</p>}
        </div>

        <button type="submit" disabled={isPending}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded">
          {isPending ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
