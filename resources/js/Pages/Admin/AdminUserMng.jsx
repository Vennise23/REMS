import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import AdminLayout from "@/Layouts/AdminLayout";
import AdminSidebar from "@/Layouts/AdminSidebar";
import EditUserModal from './EditUserModal';

export default function AdminUserMng({ auth, user }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        firstname: "",
        lastname: "",
        email: "",
        ic_number: "",
        age: "",
        born_date: "",
        phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        postal_code: "",
        role: "",
        password: "",
        password_confirmation: "",
        profile_picture: null,
    });
    const [profilePreview, setProfilePreview] = useState(null);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("/users/data");
            console.log("response", response);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error.response?.data?.error || error.message);
            alert("There was an error fetching users. Please check the console for details.");
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newUser).forEach((key) => {
            formData.append(key, newUser[key]);
        });

        try {
            const response = await axios.post("/users", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUsers([...users, response.data]);
            console.log("add user",response);
            resetForm();
            setShowAddUserForm(false);
        } catch (error) {
            console.error("Error adding user:", error);
            if (error.response && error.response.data.errors) {
                console.error("Validation Errors:", error.response.data.errors);
            }
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        console.log("picture", file);
        setNewUser({ ...newUser, profile_picture: file });
        if (file) {
            setProfilePreview(URL.createObjectURL(file));
        } else {
            setProfilePreview(null);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

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

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const handleUsersPerPageChange = (e) => {
        setUsersPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to first page
    };

    const resetForm = () => {
        setNewUser({
            firstname: "",
            lastname: "",
            email: "",
            ic_number: "",
            age: "",
            born_date: "",
            phone: "",
            address_line_1: "",
            address_line_2: "",
            city: "",
            postal_code: "",
            role: "",
            password: "",
            password_confirmation: "",
            profile_picture: null,
        });
        setProfilePreview(null);
    };

    const handleCancelAddUser = () => {
        resetForm();
        setShowAddUserForm(false);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black opacity-50 lg:hidden z-10"></div>}

            <div className="flex-1 flex flex-col h-full overflow-y-auto">
                <AdminLayout>
                    <button onClick={toggleSidebar} className="lg:hidden p-4 text-blue-800">Toggle Sidebar</button>

                    <main className="p-6 bg-white rounded-lg shadow-md flex-1 ">
                        <h2 className="text-2xl font-bold mb-4">User Management</h2>

                        <div className="flex justify-between mb-4">
                            <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search users..." className="p-2 border rounded" />
                            <button onClick={() => setShowAddUserForm(!showAddUserForm)} className="px-4 py-2 bg-blue-600 text-white rounded">
                                {showAddUserForm ? "Close Form" : "Add New User"}
                            </button>
                        </div>

                        {showAddUserForm && (
                            <form onSubmit={handleAddUser} className="mb-4 p-4 border rounded" encType="multipart/form-data">
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" value={newUser.firstname} onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })} placeholder="First Name" required />
                                    <input type="text" value={newUser.lastname} onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })} placeholder="Last Name" required />
                                    <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" required />
                                    <input type="text" value={newUser.ic_number} onChange={(e) => setNewUser({ ...newUser, ic_number: e.target.value })} placeholder="IC Number" required />
                                    <input type="number" value={newUser.age} onChange={(e) => setNewUser({ ...newUser, age: e.target.value })} placeholder="Age" min="1" max="100" />
                                    <input type="date" value={newUser.born_date} onChange={(e) => setNewUser({ ...newUser, born_date: e.target.value })} />
                                    <input type="text" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} placeholder="Phone" />
                                    <input type="text" value={newUser.address_line_1} onChange={(e) => setNewUser({ ...newUser, address_line_1: e.target.value })} placeholder="Address Line 1" />
                                    <input type="text" value={newUser.address_line_2} onChange={(e) => setNewUser({ ...newUser, address_line_2: e.target.value })} placeholder="Address Line 2" />
                                    <input type="text" value={newUser.city} onChange={(e) => setNewUser({ ...newUser, city: e.target.value })} placeholder="City" />
                                    <input type="text" value={newUser.postal_code} onChange={(e) => setNewUser({ ...newUser, postal_code: e.target.value })} placeholder="Postal Code" />
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="form-input"
                                        >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select> 
                                    <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" required />
                                    <input type="password" value={newUser.password_confirmation} onChange={(e) => setNewUser({ ...newUser, password_confirmation: e.target.value })} placeholder="Confirm Password" required />
                                    <label className="form-label">Profile Picture</label>
                                    <input type="file" onChange={handleProfilePictureChange} className="form-input" />
                                </div>
                                {profilePreview && (
                                    <div className="mt-2">
                                        <img src={profilePreview} alt="Profile Preview" className="w-24 h-24 rounded-full border" />
                                    </div>
                                )}
                                <div className="flex justify-end mt-4">
                                    <button type="button" onClick={handleCancelAddUser} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">Clear</button>
                                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add User</button>
                                </div>
                            </form>
                        )}

                        <table className="min-w-full bg-white border rounded shadow-lg">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="px-4 py-2">User</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Phone</th>
                                    <th className="px-4 py-2">Role</th>
                                    <th className="px-4 py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 flex items-center">
                                            {user.profile_picture ? (
                                                <img src={`/storage/${user.profile_picture}`} alt="Profile" className="w-8 h-8 rounded-full mr-2" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                                                    <span className="text-gray-500">N/A</span>
                                                </div>
                                            )}
                                            <div>
                                                <div>{user.firstname} {user.lastname}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">{user.email}</td>
                                        <td className="px-4 py-2">{user.phone}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 text-sm rounded ${user.role === "admin" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => handleEditClick(user)} className="text-blue-500 mx-2">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDeleteClick(user.id)} className="text-red-500">
                                                <FaTrashAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination and User Count Controls */}
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center">
                                <span>Show</span>
                                <select onChange={handleUsersPerPageChange} value={usersPerPage} className="mx-2 border rounded">
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                </select>
                                <span>users per page</span>
                            </div>
                            <div className="flex items-center">
                                <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-3 py-1 border rounded bg-gray-200 mx-1">
                                    Previous
                                </button>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 border rounded bg-gray-200 mx-1">
                                    Next
                                </button>
                            </div>
                        </div>
                    </main>
                </AdminLayout>
            </div>

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
