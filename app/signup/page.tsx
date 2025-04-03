"use client";

import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/app/actions/userActions";

type FormValues = {
  username: string;
  email: string;
  password: string;
  role: "Admin" | "Super User" | "User";
};

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        // Build a FormData object to send to the server action
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("role", data.role);

        await createUser(formData);
        // After successful creation, redirect to the sign-in page
        router.push("/signin");
      } catch (error) {
        console.error("Error creating user:", error);
        // Optionally, add error handling (e.g., display an error message)
      }
    });
  };

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
