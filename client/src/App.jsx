"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import PropTypes from "prop-types";

const UserRow = ({ user, onEdit, onDelete, isEven }) => (
  <tr className={isEven ? "bg-gray-100" : "bg-white"}>
    <td className="border-b p-2">{user.id}</td>
    <td className="border-b p-2">{user.name}</td>
    <td className="border-b p-2">{user.email}</td>
    <td className="border-b p-2">
      <button
        onClick={() => onEdit(user)}
        className="bg-yellow-500 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(user.id)}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
      >
        Del
      </button>
    </td>
  </tr>
);

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isEven: PropTypes.bool.isRequired,
};

export default function CRUDDatabase() {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
  });

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      fetch("http://localhost:2000/users").then((res) => res.json()),
  });

  const { mutate: addUser } = useMutation({
    mutationFn: (newUser) =>
      fetch("http://localhost:2000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User added successfully");
      setIsAddingItem(false);
      setFormData({ id: "", name: "", email: "" });
    },
    onError: () => toast.error("Failed to add user"),
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: (updatedUser) =>
      fetch(`http://localhost:2000/users/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setEditingId(null);
      setFormData({ id: "", name: "", email: "" });
    },
    onError: () => toast.error("Failed to update user"),
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id) =>
      fetch(`http://localhost:2000/users/${id}`, {
        method: "DELETE",
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ ...user });
  };

  const handleUpdate = () => {
    if (formData.id && formData.name && formData.email) {
      updateUser(formData);
    } else {
      toast.error("Please fill all fields");
    }
  };

  const downloadCSV = () => {
    const headers = ["ID", "Name", "Email"];
    const csvData = users.map((user) =>
      [user.id, user.name, user.email].join(",")
    );
    const csv = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">CRUD Database</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left p-2 border-b">ID</th>
              <th className="text-left p-2 border-b">Name</th>
              <th className="text-left p-2 border-b">Email</th>
              <th className="text-left p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) =>
              editingId === user.id ? (
                <tr
                  key={user.id}
                  className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                >
                  <td className="border-b p-2">
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) =>
                        setFormData({ ...formData, id: e.target.value })
                      }
                      className="w-full p-1 border rounded"
                      disabled
                    />
                  </td>
                  <td className="border-b p-2">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border-b p-2">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border-b p-2">
                    <button
                      onClick={handleUpdate}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={deleteUser}
                  isEven={index % 2 === 0}
                />
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={downloadCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Download CSV
        </button>
        <button
          onClick={() => setIsAddingItem(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add Item
        </button>
      </div>

      {isAddingItem && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Add New Item</h2>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="p-2 border rounded"
              placeholder="ID"
            />
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="p-2 border rounded"
              placeholder="Name"
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="p-2 border rounded"
              placeholder="Email"
            />
          </div>
          <button
            onClick={() => {
              if (formData.id && formData.name && formData.email) {
                addUser(formData);
              } else {
                toast.error("Please fill all fields");
              }
            }}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Save
          </button>
        </div>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
}
