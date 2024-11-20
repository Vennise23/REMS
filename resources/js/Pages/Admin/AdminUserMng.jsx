import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import AdminLayout from "@/Layouts/AdminLayout";
import AdminSidebar from "@/Layouts/AdminSidebar";
import EditUserModal from './EditUserModal';
import debounce from 'lodash/debounce';

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
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/users/data');
            if (response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error.message);
            alert("Failed to load users. Please try refreshing the page.");
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, []);

    const validateFirstLastName = async (firstname, lastname) => {
        if (!firstname || !lastname) return true;

        // Check if names are the same
        if (firstname.toLowerCase() === lastname.toLowerCase()) {
            setErrors(prev => ({
                ...prev,
                name: "First name and last name cannot be the same"
            }));
            return false;
        }

        try {
            const response = await axios.post('/check-name-availability', {
                firstname,
                lastname
            });

            if (!response.data.available) {
                setErrors(prev => ({
                    ...prev,
                    name: response.data.message
                }));
                return false;
            }

            // Clear name error if validation passes
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.name;
                return newErrors;
            });
            return true;
        } catch (error) {
            console.error('Error checking name availability:', error);
            return false;
        }
    };

    const checkEmailAvailability = async (email) => {
        try {
            const response = await axios.post('/check-email-availability', { email });
            
            if (!response.data.available) {
                setErrors(prev => ({
                    ...prev,
                    email: response.data.message
                }));
                return false;
            }
            
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.email;
                return newErrors;
            });
            return true;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    const validatePhone = (phone) => {
        // Malaysian phone number format: +60123456789 or 0123456789
        const phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
        if (!phoneRegex.test(phone)) {
            setErrors(prev => ({
                ...prev,
                phone: "Please enter a valid Malaysian phone number format (e.g., 0123456789 or +60123456789)"
            }));
            return false;
        }
        return true;
    };

    const validateIC = (ic) => {
        // Malaysian IC format: YYMMDD-PB-XXXX
        const icRegex = /^\d{6}-\d{2}-\d{4}$/;
        if (!icRegex.test(ic)) {
            setErrors(prev => ({
                ...prev,
                ic_number: "Please enter a valid IC number format (YYMMDD-PB-XXXX)"
            }));
            return false;
        }
        return true;
    };

    // Handle IC number input and auto-fill
    const handleICNumberChange = (value) => {
        setNewUser(prev => ({ ...prev, ic_number: value }));

        // Clear IC error
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.ic_number;
            return newErrors;
        });

        if (validateIC(value)) {
            // Extract date components from IC
            const year = value.substring(0, 2);
            const month = value.substring(2, 4);
            const day = value.substring(4, 6);
            
            // Determine century (assuming 00-23 is 2000s, 24-99 is 1900s)
            const fullYear = parseInt(year) > 23 ? `19${year}` : `20${year}`;
            const bornDate = `${fullYear}-${month}-${day}`;
            
            // Calculate age
            const age = calculateAge(bornDate);

            // Update form data
            setNewUser(prev => ({
                ...prev,
                born_date: bornDate,
                age: age
            }));
        }
    };

    // Handle input changes with validation
    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        switch (name) {
            case 'firstname':
            case 'lastname':
                if (newUser.firstname && newUser.lastname) {
                    await validateFirstLastName(
                        name === 'firstname' ? value : newUser.firstname,
                        name === 'lastname' ? value : newUser.lastname
                    );
                }
                break;

            case 'email':
                if (value && value.includes('@') && value.endsWith('.com')) {
                    await checkEmailAvailability(value);
                } else if (value) {
                    setErrors(prev => ({
                        ...prev,
                        email: "Email must contain @ and end with .com"
                    }));
                }
                break;

            case 'phone':
                if (value) {
                    validatePhone(value);
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.phone;
                        return newErrors;
                    });
                }
                break;

            case 'ic_number':
                handleICNumberChange(value);
                break;
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // First name validation
        if (!newUser.firstname) {
            newErrors.firstname = 'First name is required';
        }

        // Last name validation
        if (!newUser.lastname) {
            newErrors.lastname = 'Last name is required';
        }

        // Check if first name and last name are the same
        if (newUser.firstname && newUser.lastname && 
            newUser.firstname.toLowerCase() === newUser.lastname.toLowerCase()) {
            newErrors.name = 'First name and last name cannot be the same';
        }

        // Email validation
        if (!newUser.email) {
            newErrors.email = 'Email is required';
        } else if (!newUser.email.includes('@') || !newUser.email.endsWith('.com')) {
            newErrors.email = 'Email must contain @ and end with .com';
        }

        // Phone validation
        if (newUser.phone) {
            const phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
            if (!phoneRegex.test(newUser.phone)) {
                newErrors.phone = 'Please enter a valid Malaysian phone number';
            }
        }

        // IC validation
        if (!newUser.ic_number) {
            newErrors.ic_number = 'IC number is required';
        } else {
            const icRegex = /^\d{6}-\d{2}-\d{4}$/;
            if (!icRegex.test(newUser.ic_number)) {
                newErrors.ic_number = 'Please enter a valid IC number format (YYMMDD-PB-XXXX)';
            }
        }

        // Password validation
        if (!newUser.password) {
            newErrors.password = 'Password is required';
        } else if (newUser.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Password confirmation validation
        if (!newUser.password_confirmation) {
            newErrors.password_confirmation = 'Please confirm your password';
        } else if (newUser.password !== newUser.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        // Role validation
        if (!newUser.role) {
            newErrors.role = 'Please select a role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        
        // First run the client-side validation
        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Check name availability before submission
            const nameResponse = await axios.post('/api/check-name-availability', {
                firstname: newUser.firstname,
                lastname: newUser.lastname
            });

            if (!nameResponse.data.available) {
                setErrors(prev => ({
                    ...prev,
                    name: "This name combination is already registered"
                }));
                setIsSubmitting(false);
                return;
            }

            // Check email availability before submission
            const emailResponse = await axios.post('/api/check-email-availability', {
                email: newUser.email
            });

            if (!emailResponse.data.available) {
                setErrors(prev => ({
                    ...prev,
                    email: "This email is already registered"
                }));
                setIsSubmitting(false);
                return;
            }

            const formData = new FormData();
            Object.keys(newUser).forEach((key) => {
                if (newUser[key] !== null && newUser[key] !== undefined && newUser[key] !== '') {
                    formData.append(key, newUser[key]);
                }
            });

            const response = await axios.post("/users", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUsers([...users, response.data.user]);
            resetForm();
            setShowAddUserForm(false);
            alert('User added successfully!');

        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'An error occurred while adding the user.');
            }
        } finally {
            setIsSubmitting(false);
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

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="firstname"
                                            value={newUser.firstname} 
                                            onChange={handleInputChange}
                                            placeholder="First Name"
                                            className={`w-full p-2 border rounded ${
                                                errors.name || errors.firstname ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.firstname && (
                                            <span className="text-red-500 text-sm mt-1">{errors.firstname}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="lastname"
                                            value={newUser.lastname} 
                                            onChange={handleInputChange}
                                            placeholder="Last Name"
                                            className={`w-full p-2 border rounded ${
                                                errors.name || errors.lastname ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.lastname && (
                                            <span className="text-red-500 text-sm mt-1">{errors.lastname}</span>
                                        )}
                                    </div>
                                    {errors.name && (
                                        <div className="col-span-2">
                                            <span className="text-red-500 text-sm">{errors.name}</span>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={newUser.email} 
                                            onChange={handleInputChange}
                                            placeholder="Email"
                                            className={`w-full p-2 border rounded ${
                                                errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.email && (
                                            <span className="text-red-500 text-sm">{errors.email}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="phone"
                                            value={newUser.phone} 
                                            onChange={handleInputChange}
                                            placeholder="Phone (e.g., 601X-XXXXXXX)"
                                            className={`w-full p-2 border rounded ${
                                                errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.phone && (
                                            <span className="text-red-500 text-sm">{errors.phone}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="ic_number"
                                            value={newUser.ic_number} 
                                            onChange={handleInputChange}
                                            placeholder="IC Number (YYMMDD-PB-XXXX)"
                                            className={`w-full p-2 border rounded ${
                                                errors.ic_number ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.ic_number && (
                                            <span className="text-red-500 text-sm mt-1">{errors.ic_number}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="number" 
                                            value={newUser.age} 
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, age: e.target.value });
                                                if (errors.age) setErrors({ ...errors, age: '' });
                                            }} 
                                            placeholder="Age"
                                            min="1"
                                            max="100"
                                            className={`w-full p-2 border rounded ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.age && <span className="text-red-500 text-sm">{errors.age}</span>}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="date" 
                                            value={newUser.born_date} 
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, born_date: e.target.value });
                                                if (errors.born_date) setErrors({ ...errors, born_date: '' });
                                            }} 
                                            placeholder="Born Date"
                                            className={`w-full p-2 border rounded ${errors.born_date ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.born_date && <span className="text-red-500 text-sm">{errors.born_date}</span>}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            value={newUser.address_line_1} 
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, address_line_1: e.target.value });
                                                if (errors.address_line_1) setErrors({ ...errors, address_line_1: '' });
                                            }} 
                                            placeholder="Address Line 1"
                                            className={`w-full p-2 border rounded ${errors.address_line_1 ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.address_line_1 && <span className="text-red-500 text-sm">{errors.address_line_1}</span>}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            value={newUser.address_line_2} 
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, address_line_2: e.target.value });
                                                if (errors.address_line_2) setErrors({ ...errors, address_line_2: '' });
                                            }} 
                                            placeholder="Address Line 2"
                                            className={`w-full p-2 border rounded ${errors.address_line_2 ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.address_line_2 && <span className="text-red-500 text-sm">{errors.address_line_2}</span>}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            value={newUser.city} 
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, city: e.target.value });
                                                if (errors.city) setErrors({ ...errors, city: '' });
                                            }} 
                                            placeholder="City"
                                            className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.city && <span className="text-red-500 text-sm">{errors.city}</span>}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            value={newUser.postal_code} 
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, postal_code: e.target.value });
                                                if (errors.postal_code) setErrors({ ...errors, postal_code: '' });
                                            }} 
                                            placeholder="Postal Code"
                                            className={`w-full p-2 border rounded ${errors.postal_code ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.postal_code && <span className="text-red-500 text-sm">{errors.postal_code}</span>}
                                    </div>

                                    <div className="form-group">
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, role: e.target.value });
                                                if (errors.role) setErrors({ ...errors, role: '' });
                                            }}
                                            className={`w-full p-2 border rounded ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {errors.role && <span className="text-red-500 text-sm">{errors.role}</span>}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="password" 
                                            value={newUser.password} 
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, password: e.target.value });
                                                if (errors.password) setErrors({ ...errors, password: '' });
                                            }} 
                                            placeholder="Password"
                                            className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="password" 
                                            value={newUser.password_confirmation} 
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, password_confirmation: e.target.value });
                                                if (errors.password_confirmation) setErrors({ ...errors, password_confirmation: '' });
                                            }} 
                                            placeholder="Confirm Password"
                                            className={`w-full p-2 border rounded ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.password_confirmation && <span className="text-red-500 text-sm">{errors.password_confirmation}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Profile Picture</label>
                                        <input type="file" onChange={handleProfilePictureChange} className="form-input" />
                                    </div>
                                </div>

                                {profilePreview && (
                                    <div className="mt-2">
                                        <img src={profilePreview} alt="Profile Preview" className="w-24 h-24 rounded-full border" />
                                    </div>
                                )}

                                <div className="flex justify-end mt-4">
                                    <button type="button" onClick={handleCancelAddUser} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">Clear</button>
                                    <button 
                                        type="submit" 
                                        className={`px-4 py-2 bg-green-600 text-white rounded ${
                                            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                                        }`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Adding User...' : 'Add User'}
                                    </button>
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
