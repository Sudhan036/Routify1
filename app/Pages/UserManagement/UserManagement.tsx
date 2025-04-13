"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type User = {
  id: string;
  email: string;
  firstName: string;
  banned: boolean;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to ban or unban a user
  const updateUserStatus = async (userId: string, action: "ban" | "unban") => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      toast.success(`User ${action}ned successfully`);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, banned: action === "ban" } : user
        )
      );
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      toast.error(`Error ${action}ning user`);
    }
  };

  // Function to delete a user
  const deleteUser = async (userId: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "delete" }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <p className="text-sm text-gray-500 mb-4">
        Manage all users here. You can ban, unban, or delete them if needed.
      </p>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded shadow-sm">
          <table className="table-auto w-full text-left border border-gray-200">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 font-semibold text-gray-700">ID</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Email</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="odd:bg-gray-50 even:bg-white hover:bg-gray-100 transition-colors"
                >
                  <td className="px-4 py-2 border-b border-gray-200">{user.id}</td>
                  <td className="px-4 py-2 border-b border-gray-200">{user.email}</td>
                  <td className="px-4 py-2 border-b border-gray-200">{user.firstName}</td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    {user.banned ? (
                      <span className="text-red-600 font-semibold">Banned</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 space-x-2">
                    {user.banned ? (
                      <button
                        onClick={() => updateUserStatus(user.id, "unban")}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserStatus(user.id, "ban")}
                        className="bg-[#d90429] hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                      >
                        Ban
                      </button>
                    )}
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="bg-[#85817d] hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
