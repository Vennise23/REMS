// resources/js/Pages/Admin/AdminUserMng.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "@/Layouts/AdminLayout";
import AdminSidebar from "@/Layouts/AdminSidebar";
import { router } from "@inertiajs/react";
import EditUserModal from './EditUserModal';

export default function AdminUserMng() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]); // State to store users from the database
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
    }); // Include password in newUser state
    const [showAddUserForm, setShowAddUserForm] = useState(false); // Toggle add user form

    //add user
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get("/users/data");
            console.log(response.data); // Check the data fetched from backend
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch users data from the Laravel route
    useEffect(() => {
        fetchUsers();
    }, []);

    // Function to handle form submission for adding a new user
    const handleAddUser = async (e) => {
        e.preventDefault();

        console.log("Adding User:", newUser); // Log the user details to verify data

        try {
            const response = await axios.post("/users", newUser);
            console.log("User Added:", response.data); // Log the response from backend

            // Update the users list with the new user
            setUsers([...users, response.data]);
            setNewUser({ name: "", email: "", password: "" }); // Reset form
            setShowAddUserForm(false); // Close add user form
        } catch (error) {
            console.error("Error adding user:", error);
            if (error.response && error.response.data.errors) {
                console.error("Validation Errors:", error.response.data.errors);
            }
        }
    };

    //function edit
    const handleEditClick = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    //function delete
    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`/users/${id}`);
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleUsersPerPageChange = (e) => {
        setUsersPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to first page on users per page change
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Filtered and paginated users
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black opacity-50 lg:hidden z-10"
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full ">
                <AdminLayout>
                    {/* Mobile toggle button for sidebar */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-4 text-blue-800"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            ></path>
                        </svg>
                    </button>

                   

                    {/* Page Content */}
                    <main className="p-6 bg-white rounded-lg shadow-md flex-1 overflow-y-auto max-h-[86vh]">

        
                        <p>Manage user / User Management</p>
                        <br></br>

                        <h2 className="text-2xl font-bold mb-4">
                            User Management
                        </h2>

                        {/* Search Bar and Add User Button on the Same Line */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search users..."
                                className="p-2 border border-gray-300 rounded w-full sm:w-2/3"
                            />
                            <button
                                onClick={() =>
                                    setShowAddUserForm(!showAddUserForm)
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
                            >
                                {showAddUserForm ? "Cancel" : "Add New User"}
                            </button>
                        </div>

                        {/* Add User Form */}
                        {showAddUserForm && (
                            <form
                                onSubmit={handleAddUser}
                                className="mb-4 p-4 border border-gray-300 rounded"
                            >
                                <div className="mb-2">
                                    <label className="block text-sm font-medium">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                name: e.target.value,
                                            })
                                        }
                                        required
                                        className="p-2 border border-gray-300 rounded w-full"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                email: e.target.value,
                                            })
                                        }
                                        required
                                        className="p-2 border border-gray-300 rounded w-full"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                password: e.target.value,
                                            })
                                        }
                                        required
                                        className="p-2 border border-gray-300 rounded w-full"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded"
                                >
                                    Add User
                                </button>
                            </form>
                        )}

                        {/* User Table */}
                        <div className="overflow-x-auto mt-6">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 border-b text-left">
                                            Name
                                        </th>
                                        <th className="px-4 py-2 border-b text-left">
                                            Email
                                        </th>
                                        <th className="px-4 py-2 border-b text-left">
                                            Created Date
                                        </th>
                                        <th className="px-4 py-2 border-b text-left">
                                            Updated Date
                                        </th>
                                        <th className="px-4 py-2 border-b text-left">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-100"
                                        >
                                            <td className="px-4 py-2 border-b">
                                                {user.name}
                                            </td>
                                            <td className="px-4 py-2 border-b">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-2 border-b">
                                                {new Date(
                                                    user.created_at
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 border-b">
                                                {new Date(
                                                    user.updated_at
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 border-b">
                                            <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:underline mr-2">Edit</button>
                                            <button onClick={() => handleDeleteClick(user.id)} className="text-red-600 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Filter and Pagination Controls on the Same Line */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="usersPerPage">Show</label>
                                <select
                                    id="usersPerPage"
                                    value={usersPerPage}
                                    onChange={handleUsersPerPageChange}
                                    className="p-2 border border-gray-300 rounded"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={25}>25</option>
                                </select>
                                <span>users per page</span>
                            </div>

                            <div className="flex space-x-2">
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                handlePageChange(index + 1)
                                            }
                                            className={`px-4 py-2 border rounded ${
                                                currentPage === index + 1
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200"
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </main>
                </AdminLayout>
            </div>
            {/* edit modal */}
            {showEditModal && (
                <EditUserModal 
                    user={selectedUser} 
                    onClose={() => setShowEditModal(false)} 
                    onUpdate={fetchUsers} 
                />
            )}
        </div>
    );
}
