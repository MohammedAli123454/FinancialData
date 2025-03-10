'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createUser, deleteUser, getUsers, updateUser, type SafeUser } from '@/app/actions/userActions';
import { Edit, Trash } from 'lucide-react';

// Zod schema for form validation. 
// For new user creation, password is required with minimum 6 characters.
const userSchema = z
  .object({
    id: z.number().optional(),
    username: z.string().min(1, { message: 'Username is required' }),
    password: z.string().optional(),
    role: z.string().min(1, { message: 'Role is required' }),
  })
  .superRefine((data, ctx) => {
    if (!data.id && (!data.password || data.password.length < 6)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required and must be at least 6 characters',
        path: ['password'],
      });
    }
  });

type FormValues = z.infer<typeof userSchema>;

export default function RegisterPage() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<SafeUser | null>(null);

  const { data: users = [] } = useQuery<SafeUser[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(userSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) =>
      data.id ? updateUser({ ...data, id: data.id.toString() }) : createUser(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success(variables.id ? 'User updated!' : 'User created!');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        reset();
        setSelectedUserId(null);
      } else if (data.error) {
        toast.error(data.error);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId.toString()),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('User deleted!');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else if (data.error) {
        toast.error(data.error);
      }
    },
  });

  const handleEdit = (user: SafeUser) => {
    setValue('id', user.id);
    setValue('username', user.username);
    setValue('role', user.role);
    // Do not preset password value.
    setSelectedUserId(user.id);
  };

  const onSubmit = (data: FormValues) => mutation.mutate(data);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <ToastContainer position="top-center" autoClose={3000} className="font-sans" />

      <main className="flex flex-col flex-grow p-4">
        {/* Page Title */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800">User Management</h1>
        </div>

        {/* Form Section */}
        <section className="bg-white rounded-lg shadow p-4 mb-4">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Username Field */}
              <div className="flex flex-col">
                <label htmlFor="username" className="mb-1 text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  placeholder="Enter username"
                  {...register('username')}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.username && (
                  <span className="mt-1 text-xs text-red-500">{errors.username.message}</span>
                )}
              </div>
              {/* Password Field */}
              <div className="flex flex-col">
                <label htmlFor="password" className="mb-1 text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  {...register('password')}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.password && (
                  <span className="mt-1 text-xs text-red-500">{errors.password.message}</span>
                )}
              </div>
              {/* Role Field */}
              <div className="flex flex-col">
                <label htmlFor="role" className="mb-1 text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  {...register('role')}
                  defaultValue="user"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="user">User</option>
                  <option value="superuser">Super User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <span className="mt-1 text-xs text-red-500">{errors.role.message}</span>
                )}
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                {selectedUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setSelectedUserId(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {mutation.isPending ? 'Saving...' : selectedUserId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Table Section: Scrollable body with fixed headers */}
        <section className="flex flex-col flex-grow bg-white rounded-lg shadow overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Sr. No</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Username</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Role</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-200`}
                  >
                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                    <td className="px-4 py-2 text-sm">{user.username}</td>
                    <td className="px-4 py-2 text-sm capitalize">{user.role}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1 rounded hover:bg-gray-200"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-1 rounded hover:bg-gray-200"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-6 text-sm">
                Are you sure you want to delete user{' '}
                <span className="font-bold">{userToDelete.username}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteMutation.mutate(userToDelete.id);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
