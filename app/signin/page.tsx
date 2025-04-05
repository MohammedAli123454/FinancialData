// "use client";
// import { useState } from "react";
// import { signIn } from "next-auth/react";

// export default function SignInPage() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");

//     const res = await signIn("credentials", {
//       redirect: false,
//       email: form.email,
//       password: form.password,
//     });

//     if (res?.error) {
//       setError("Invalid email or password");
//     } else {
//       // Redirect to the homepage or dashboard after successful sign in
//       window.location.href = "/";
//     }
//   };

//   return (
//     <div className="max-w-sm mx-auto my-8 p-8 border rounded-lg shadow bg-white">
//       <h1 className="text-center text-2xl mb-6">Sign In</h1>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label htmlFor="email" className="block text-gray-700 font-medium">
//             Email:
//           </label>
//           <input
//             id="email"
//             type="email"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             required
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="password" className="block text-gray-700 font-medium">
//             Password:
//           </label>
//           <input
//             id="password"
//             type="password"
//             name="password"
//             value={form.password}
//             onChange={handleChange}
//             required
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
//         >
//           Sign In
//         </button>
//       </form>
//       {error && (
//         <p className="text-red-500 text-center mt-4 font-medium">{error}</p>
//       )}
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      // Show a success message if login is successful
      setSuccess("Login successful!");
    }
  };

  return (
    <div className="max-w-sm mx-auto my-8 p-8 border rounded-lg shadow bg-white">
      <h1 className="text-center text-2xl mb-6">Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium">
            Email:
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium">
            Password:
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Sign In
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-center mt-4 font-medium">{error}</p>
      )}
      {success && (
        <p className="text-green-500 text-center mt-4 font-medium">{success}</p>
      )}
    </div>
  );
}
