import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import AdminSidebar from "@/Layouts/Admin/AdminSidebar";
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
    const [documentType, setDocumentType] = useState('ic');
    const [emailError, setEmailError] = useState('');
    const [icError, setIcError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsPostalCode, setSuggestionsPostalCode] = useState([]);

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

    const checkNameUniqueness = async (firstname, lastname) => {
        try {
            const response = await axios.post('/api/check-name-availability', { 
                firstname, 
                lastname 
            });
            if (!response.data.available) {
                setErrors(prev => ({
                    ...prev,
                    name: "This name combination is already registered"
                }));
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking name:', error);
            return false;
        }
    };

    const checkEmailUniqueness = async (email) => {
        try {
            const response = await axios.post('/api/check-email-availability', { email });
            if (!response.data.available) {
                setErrors(prev => ({
                    ...prev,
                    email: "This email is already registered"
                }));
                return false;
            }
            // Clear email error if it's available
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

    // Add Malaysian phone validation function
    const validateMalaysianPhone = (phone) => {
        // Remove any non-digits
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Malaysian phone format: 01xxxxxxxx (10-11 digits)
        const phoneRegex = /^01\d{8,9}$/;
        
        return phoneRegex.test(cleanPhone);
    };

    const handleInputChange = async (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'firstname':
                setNewUser(prev => ({ ...prev, firstname: value }));
                // Check if same as lastname
                if (value.toLowerCase() === newUser.lastname.toLowerCase()) {
                    setErrors(prev => ({
                        ...prev,
                        name: "First name and last name cannot be the same"
                    }));
                } else {
                    // Clear name error if they're different
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.name;
                        return newErrors;
                    });
                    // Check uniqueness if both fields are filled
                    if (value && newUser.lastname) {
                        await checkNameUniqueness(value, newUser.lastname);
                    }
                }
                break;

            case 'lastname':
                setNewUser(prev => ({ ...prev, lastname: value }));
                // Check if same as firstname
                if (value.toLowerCase() === newUser.firstname.toLowerCase()) {
                    setErrors(prev => ({
                        ...prev,
                        name: "First name and last name cannot be the same"
                    }));
                } else {
                    // Clear name error if they're different
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.name;
                        return newErrors;
                    });
                    // Check uniqueness if both fields are filled
                    if (newUser.firstname && value) {
                        await checkNameUniqueness(newUser.firstname, value);
                    }
                }
                break;

            case 'email':
                setNewUser(prev => ({ ...prev, email: value }));
                // Email validation
                if (!value.includes('@') || !value.toLowerCase().endsWith('.com')) {
                    setErrors(prev => ({
                        ...prev,
                        email: "Email must contain '@' and end with '.com'"
                    }));
                } else {
                    await checkEmailUniqueness(value);
                }
                break;

            case 'phone':
                // Only allow numbers
                const phoneNumbers = value.replace(/\D/g, '');
                setNewUser(prev => ({ ...prev, phone: phoneNumbers }));
                
                // Validate Malaysian phone format
                if (phoneNumbers.length > 0 && !validateMalaysianPhone(phoneNumbers)) {
                    setErrors(prev => ({
                        ...prev,
                        phone: "Please enter a valid Malaysian phone number (e.g., 0123456789)"
                    }));
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.phone;
                        return newErrors;
                    });
                }
                break;

            case 'ic_number':
                // Only allow numbers
                const numbersOnly = value.replace(/\D/g, '');
                setNewUser(prev => ({ ...prev, ic_number: numbersOnly }));

                console.log("IC Number Input:", numbersOnly); // Debugging log

                // Validate IC number format
                const icRegex = /^\d{12}$/; // Check for exactly 12 digits
                if (!icRegex.test(numbersOnly)) {
                    setErrors(prev => ({
                        ...prev,
                        ic_number: "Please enter a valid IC number format (YYMMDDPBXXXX)"
                    }));
                    return;
                }

                // Extract date components
                const year = numbersOnly.substring(0, 2);
                const month = numbersOnly.substring(2, 4);
                const day = numbersOnly.substring(4, 6);
                const genderDigit = parseInt(numbersOnly.charAt(11)); // Get the last digit for gender
                
                // Validate date components
                const monthNum = parseInt(month);
                const dayNum = parseInt(day);
                
                if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
                    setErrors(prev => ({
                        ...prev,
                        ic_number: "Invalid date in IC number"
                    }));
                    return;
                }

                // Determine century
                const fullYear = parseInt(year) > 23 ? `19${year}` : `20${year}`;
                const bornDate = `${fullYear}-${month}-${day}`;
                
                // Calculate age
                const today = new Date();
                const birthDate = new Date(bornDate);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                // Determine gender based on last digit
                const gender = genderDigit % 2 === 0 ? 'female' : 'male';

                // Update form data
                setNewUser(prev => ({
                    ...prev,
                    born_date: bornDate,
                    age: age.toString(),
                    gender: gender
                }));

                // Clear IC error
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.ic_number;
                    return newErrors;
                });
                break;

            case 'passport_number':
                // Allow only alphanumeric characters
                if (value === '' || /^[a-zA-Z0-9]*$/.test(value)) {
                    setNewUser(prev => ({ ...prev, [name]: value }));
                }
                break;

            case 'password':
                setNewUser(prev => ({ ...prev, password: value }));
                // Validate password length
                if (value.length < 8) {
                    setErrors(prev => ({
                        ...prev,
                        password: "Password must be at least 8 characters long"
                    }));
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.password;
                        return newErrors;
                    });
                }
                // Check if confirm password matches
                if (newUser.confirm_password && value !== newUser.confirm_password) {
                    setErrors(prev => ({
                        ...prev,
                        confirm_password: "Passwords do not match"
                    }));
                }
                break;

            case 'confirm_password':
                setNewUser(prev => ({ ...prev, confirm_password: value }));
                // Check if passwords match
                if (value !== newUser.password) {
                    setErrors(prev => ({
                        ...prev,
                        confirm_password: "Passwords do not match"
                    }));
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.confirm_password;
                        return newErrors;
                    });
                }
                break;

            default:
                setNewUser(prev => ({ ...prev, [name]: value }));
        }

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate first name and last name
        if (!newUser.firstname) {
            newErrors.firstname = 'First name is required';
        }
        if (!newUser.lastname) {
            newErrors.lastname = 'Last name is required';
        }
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
                newErrors.ic_number = 'Please enter a valid IC number format (YYMMDDPBXXXX)';
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

        // Required fields validation
        if (!newUser.address_line_1) {
            newErrors.address_line_1 = 'Address Line 1 is required';
        }

        if (!newUser.city) {
            newErrors.city = 'City is required';
        }

        if (!newUser.postal_code) {
            newErrors.postal_code = 'Postal Code is required';
        } else if (!/^\d{5}$/.test(newUser.postal_code)) {
            newErrors.postal_code = 'Postal Code must be 5 digits';
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

            if (newUser.profile_picture) {
                formData.append('profile_picture', newUser.profile_picture);
            }

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

    const handleAddressChange = (e) => {
        const { value } = e.target;
        setNewUser({ ...newUser, address_line_1: value });
        if (value.length > 2) {
            fetchSuggestions(value, "address");
        } else {
            setSuggestions([]);
        }
    };

    const fetchSuggestions = async (query, type) => {
        try {
            const url = `/api/place-autocomplete?query=${query}&type=${type}`;
            const response = await fetch(url);
            const data = await response.json();
            // console.log("data suggestion: ", data);

            if (data.predictions && Array.isArray(data.predictions)) {
                if (type === "address") {
                    const suggestions = data.predictions.map((prediction) => ({
                        description: prediction.description,
                        placeId: prediction.place_id,
                        geometry: prediction.geometry,
                    }));
                    setSuggestions(suggestions);
                } else {
                    setSuggestionsPostalCode(
                        data.predictions.map(
                            (prediction) => prediction.description
                        )
                    );
                }
            } else {
                if (type === "address") {
                    setSuggestions([]);
                } else {
                    setSuggestionsPostalCode([]);
                }
            }
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
        }
    };

    const fetchPostalCode = async (placeId) => {
        try {
            const url = `/api/geocode?place_id=${placeId}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log("data postal code: ", data);

            if (data.status === "OK" && data.results.length > 0) {
                const addressComponents = data.results[0].address_components;

                const streetNumber = addressComponents.find((component) =>
                    component.types.includes("street_number")
                );
                const streetAddress_1 = addressComponents.find((component) =>
                    component.types.includes("route")
                );
                const streetAddress_2 = addressComponents.find((component) =>
                    component.types.includes("sublocality")
                );
                const city = addressComponents.find((component) =>
                    component.types.includes("locality")
                );
                const country = addressComponents.find((component) =>
                    component.types.includes("country")
                );
                const postalCodeComponent = addressComponents.find(
                    (component) => component.types.includes("postal_code")
                );

                const { lat, lng } = data.results[0].geometry.location;
                const address_line_1 = streetNumber
                    ? `${streetNumber.long_name}, ${
                          streetAddress_1 ? streetAddress_1.long_name : ""
                      }`
                    : streetAddress_1
                    ? streetAddress_1.long_name
                    : "";

                return {
                    address_line_1,
                    address_line_2: streetAddress_2
                        ? streetAddress_2.long_name
                        : "",
                    city: city ? city.long_name : "",
                    country: country ? country.long_name : "",
                    postalCode: postalCodeComponent
                        ? postalCodeComponent.long_name
                        : null,
                    lat,
                    lng,
                };
            }

            return null;
        } catch (error) {
            console.error("Error fetching postal code:", error);
            return null;
        }
    };

    const fetchPostalCodeFromGeonames = async (lat, lng) => {
        try {
            const username = "rems.com";
            const url = `http://api.geonames.org/findNearbyPostalCodesJSON?lat=${lat}&lng=${lng}&username=${username}`;

            const response = await fetch(url);
            const data = await response.json();
            // console.log("checking geonames")

            if (data.postalCodes && data.postalCodes.length > 0) {
                const postalInfo = data.postalCodes[0];
                return {
                    postalCode: postalInfo.postalCode,
                    placeName: postalInfo.placeName,
                    adminName1: postalInfo.adminName1,
                };
            }

            return null;
        } catch (error) {
            console.error("Error fetching postal code from Geonames:", error);
            return null;
        }
    };

    const onAddressSelect = async (suggestion) => {
        try {
            const googleResult = await fetchPostalCode(suggestion.placeId);

            if (googleResult) {
                const {
                    lat,
                    lng,
                    postalCode,
                    address_line_1,
                    address_line_2,
                    city,
                    country,
                } = googleResult;

                let postalInfo = postalCode
                    ? { postalCode }
                    : await fetchPostalCodeFromGeonames(lat, lng);

                setNewUser({
                    ...newUser,
                    address_line_1,
                    address_line_2,
                    city,
                    country,
                    postal_code: postalInfo?.postalCode || postalCode || "",
                });
            }
        } catch (error) {
            console.error("Error selecting address:", error);
        }

        setSuggestions([]);
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

    // Add handleChange function
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear any existing error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Add file type validation function
    const validateFileType = (file) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        return validImageTypes.includes(file.type);
    };

    // Update the handleFileChange function
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            if (validateFileType(file)) {
                if (file.size <= 2 * 1024 * 1024) { // 2MB limit
                    setNewUser(prev => ({
                        ...prev,
                        profile_picture: file
                    }));
                    // Add preview
                    setProfilePreview(URL.createObjectURL(file));
                    // Clear any existing error
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.profile_picture;
                        return newErrors;
                    });
                } else {
                    setErrors(prev => ({
                        ...prev,
                        profile_picture: "File size should not exceed 2MB"
                    }));
                    setProfilePreview(null);
                }
            } else {
                setErrors(prev => ({
                    ...prev,
                    profile_picture: "Please upload only image files (JPEG, PNG, GIF)"
                }));
                setProfilePreview(null);
            }
        }
    };

   

    // Update form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all required fields
        const newErrors = {};

        // Check required fields
        if (!newUser.firstname) newErrors.firstname = "First name is required";
        if (!newUser.lastname) newErrors.lastname = "Last name is required";
        if (!newUser.email) newErrors.email = "Email is required";
        if (!newUser.phone) newErrors.phone = "Phone number is required";
        if (!newUser.ic_number) newErrors.ic_number = "IC number is required";
        if (!newUser.address_line_1) newErrors.address_line_1 = "Address is required";
        if (!newUser.city) newErrors.city = "City is required";
        if (!newUser.postal_code) newErrors.postal_code = "Postal code is required";
        
        // Password validation
        if (!newUser.password) {
            newErrors.password = "Password is required";
        } else if (newUser.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long";
        }

        // Confirm password validation
        if (!newUser.confirm_password) {
            newErrors.confirm_password = "Please confirm your password";
        } else if (newUser.password !== newUser.confirm_password) {
            newErrors.confirm_password = "Passwords do not match";
        }

        // If there are errors, display them and stop submission
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // Create FormData object to handle file upload
            const formData = new FormData();
            
            // Append all user data to FormData
            Object.keys(newUser).forEach(key => {
                if (key === 'profile_picture' && newUser[key]) {
                    formData.append('profile_picture', newUser[key]);
                } else if (newUser[key]) {
                    formData.append(key, newUser[key]);
                }
            });

            // Submit the form data
            const response = await axios.post('/api/users', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            });
            
            if (response.data.success) {
                // Clear form and show success message
                setNewUser({
                    firstname: '',
                    lastname: '',
                    email: '',
                    phone: '',
                    ic_number: '',
                    passport: '',
                    address_line_1: '',
                    address_line_2: '',
                    city: '',
                    postal_code: '',
                    password: '',
                    confirm_password: '',
                    gender: '',
                    age: '',
                    born_date: '',
                    profile_picture: null
                });
                setErrors({});
                alert('User added successfully!');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            if (error.response) {
                // Handle specific error messages from the server
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    setErrors(prev => ({
                        ...prev,
                        submit: error.response.data.message || "Error adding user. Please try again."
                    }));
                }
            } else {
                setErrors(prev => ({
                    ...prev,
                    submit: "Network error. Please try again."
                }));
            }
        }
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
                            <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded" encType="multipart/form-data">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="firstname"
                                            value={newUser.firstname} 
                                            onChange={handleInputChange}
                                            placeholder="First Name"
                                            className={`w-full p-2 border rounded ${
                                                errors.firstname || errors.name ? 'border-red-500' : 'border-gray-300'
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
                                                errors.lastname || errors.name ? 'border-red-500' : 'border-gray-300'
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
                                            placeholder="Phone Number (e.g., 0123456789)"
                                            maxLength="11"
                                            className={`w-full p-2 border rounded ${
                                                errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.phone && (
                                            <span className="text-red-500 text-sm mt-1">{errors.phone}</span>
                                        )}
                                    </div>

                                    <div className="form-group col-span-2">
                                        <label className="block text-gray-700 mb-2">Document Type</label>
                                        <div className="flex gap-4 mb-2">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="document_type"
                                                    value="ic"
                                                    checked={documentType === 'ic'}
                                                    onChange={() => {
                                                        setDocumentType('ic');
                                                        setNewUser(prev => ({
                                                            ...prev,
                                                            ic_number: '',
                                                            passport_number: '',
                                                            age: '',
                                                            born_date: '',
                                                            gender: ''
                                                        }));
                                                    }}
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">IC Number</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="document_type"
                                                    value="passport"
                                                    checked={documentType === 'passport'}
                                                    onChange={() => {
                                                        setDocumentType('passport');
                                                        setNewUser(prev => ({
                                                            ...prev,
                                                            ic_number: '',
                                                            passport_number: '',
                                                            age: '',
                                                            born_date: '',
                                                            gender: ''
                                                        }));
                                                    }}
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">Passport</span>
                                            </label>
                                        </div>

                                        {documentType === 'ic' && (
                                            <div className="form-group">
                                                <input 
                                                    type="text" 
                                                    name="ic_number"
                                                    value={newUser.ic_number} 
                                                    onChange={handleInputChange}
                                                    placeholder="IC Number (12 digits)"
                                                    maxLength="12"
                                                    className={`w-full p-2 border rounded ${
                                                        errors.ic_number ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors.ic_number && (
                                                    <span className="text-red-500 text-sm mt-1">{errors.ic_number}</span>
                                                )}
                                            </div>
                                        )}
                                        {documentType === 'passport' && (
                                            <input 
                                                type="text" 
                                                name="passport_number"
                                                value={newUser.passport_number || ''} 
                                                onChange={handleInputChange}
                                                placeholder="Enter passport number"
                                                className={`w-full p-2 border rounded ${
                                                    errors.passport_number ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        )}
                                        {errors.passport_number && documentType === 'passport' && (
                                            <span className="text-red-500 text-sm mt-1">{errors.passport_number}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="number" 
                                            name="age"
                                            value={newUser.age} 
                                            onChange={handleInputChange}
                                            placeholder="Age"
                                            readOnly={documentType === 'ic'}
                                            className={`w-full p-2 border rounded ${
                                                documentType === 'ic' ? 'bg-gray-100' : ''
                                            }`}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="date" 
                                            name="born_date"
                                            value={newUser.born_date} 
                                            onChange={handleInputChange}
                                            readOnly={documentType === 'ic'}
                                            className={`w-full p-2 border rounded ${
                                                documentType === 'ic' ? 'bg-gray-100' : ''
                                            }`}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <select
                                            name="gender"
                                            value={newUser.gender}
                                            onChange={handleInputChange}
                                            disabled={documentType === 'ic'}
                                            className={`w-full p-2 border rounded ${
                                                documentType === 'ic' ? 'bg-gray-100' : ''
                                            }`}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="address_line_1"
                                            placeholder="Address Line 1*"
                                            value={
                                                newUser.address_line_1
                                            }
                                            onChange={handleAddressChange}
                                            required
                                            className="p-2 border rounded-md w-full"
                                        />
                                        {/* Display address suggestions */}
                                        {suggestions.length > 0 && (
                                            <ul className="suggestions-list absolute bg-white border border-gray-300 w-full max-h-40 overflow-auto z-10">
                                                {suggestions.map(
                                                    (suggestion, index) => (
                                                        <li
                                                            key={index}
                                                            onClick={() =>
                                                                onAddressSelect(
                                                                    suggestion
                                                                )
                                                            }
                                                            className="p-2 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <div className="font-bold">
                                                                {suggestion.description ||
                                                                    "Unknown Address"}
                                                            </div>
                                                            {/* <div className="text-sm text-gray-500">
                                                                {suggestion.city ||
                                                                    "Unknown City"}{" "}
                                                                ,{" "}
                                                                {suggestion.country ||
                                                                    "Unknown Region"}
                                                            </div> */}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="address_line_2"
                                            placeholder="Address Line 2"
                                            value={newUser.address_line_2}
                                            onChange={handleChange}
                                            className={`w-full p-2 border rounded ${
                                                errors.address_line_2 ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.address_line_2 && (
                                            <span className="text-red-500 text-sm">{errors.address_line_2}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="city"
                                            placeholder="City*"
                                            value={newUser.city}
                                            onChange={handleChange}
                                            className={`w-full p-2 border rounded ${
                                                errors.city ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.city && (
                                            <span className="text-red-500 text-sm">{errors.city}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="postal_code"
                                            placeholder="Postal Code*"
                                            value={newUser.postal_code}
                                            onChange={handleChange}
                                            className={`w-full p-2 border rounded ${
                                                errors.postal_code ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.postal_code && (
                                            <span className="text-red-500 text-sm">{errors.postal_code}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, role: e.target.value });
                                                if (errors.role) setErrors({ ...errors, role: '' });
                                            }}
                                            className={`w-full p-2 border rounded ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {errors.role && <span className="text-red-500 text-sm">{errors.role}</span>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <input 
                                                type="password" 
                                                name="password"
                                                value={newUser.password}
                                                onChange={handleInputChange}
                                                placeholder="Password*"
                                                className={`w-full p-2 border rounded ${
                                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.password && (
                                                <span className="text-red-500 text-sm">{errors.password}</span>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <input 
                                                type="password" 
                                                name="confirm_password"
                                                value={newUser.confirm_password}
                                                onChange={handleInputChange}
                                                placeholder="Confirm Password*"
                                                className={`w-full p-2 border rounded ${
                                                    errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.confirm_password && (
                                                <span className="text-red-500 text-sm">{errors.confirm_password}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group col-span-2">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1">
                                                <input 
                                                    type="file"
                                                    name="profile_picture"
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className={`w-full p-2 border rounded ${
                                                        errors.profile_picture ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors.profile_picture && (
                                                    <span className="text-red-500 text-sm">{errors.profile_picture}</span>
                                                )}
                                                <span className="text-sm text-gray-500">
                                                    Accepted formats: JPEG, PNG, GIF (Max: 2MB)
                                                </span>
                                            </div>
                                            {profilePreview && (
                                                <div className="flex-shrink-0">
                                                    <img 
                                                        src={profilePreview} 
                                                        alt="Profile Preview" 
                                                        className="w-24 h-24 object-cover rounded-full border"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

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
                                                <img 
                                                    src={user.profile_picture ? `/storage/profile_pictures/${user.profile_picture}` : null} 
                                                    alt={`${user.firstname}'s profile`} 
                                                    className="w-10 h-10 object-cover rounded-full mr-2"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iNDUiIGZpbGw9IiNhM2EzYTMiLz48cGF0aCBkPSJNMjEzIDIxNWMwLTM0LTM4LTYyLTg1LTYycy04NSAyOC04NSA2MnYxN2gxNzB6IiBmaWxsPSIjYTNhM2EzIi8+PC9zdmc+';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                                                    <span className="text-gray-500 text-sm">
                                                        {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">{user.firstname} {user.lastname}</div>
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
