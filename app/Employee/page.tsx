"use client"
import { useState, ChangeEvent, FormEvent } from 'react';

interface Employee {
  name: string;
  position: string;
}

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<Employee>({ name: '', position: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.name.trim() && formData.position.trim()) {
      setEmployees([...employees, formData]);
      setFormData({ name: '', position: '' });
    }
  };

  return (
    <div className="min-h-screen p-5 font-sans">
      {/* Employee Form */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Add Employee</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="name"
            placeholder="Employee Name"
            value={formData.name}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={formData.position}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Employee
          </button>
        </form>
      </div>

      {/* Employee Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Employee List</h2>
        <table className="w-full table-auto border-collapse">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Position</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{emp.name}</td>
                  <td className="border px-4 py-2">{emp.position}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="border px-4 py-6 text-center">
                  No employees added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
