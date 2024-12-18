import React, { useState, useEffect } from "react";
import { useForm, Head, usePage } from "@inertiajs/react";
import Header from "@/layouts/HeaderMenu";
import UserSidebar from "@/Components/UserSidebar";
import axios from "axios";
import { debounce } from "lodash";


export default function Profile({ auth, user }) {
    const { csrf_token } = usePage().props;

    const originalEmail = user.email; // Define the original email here
    const { data, setData, processing, errors, setError, clearErrors, post } =
        useForm({
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            email: user.email || "",
            ic_number: user.ic_number || "",
            age: user.age || "",
            born_date: user.born_date || "",
            phone: user.phone || "",
            gender: user.gender || "",
            address_line_1: user.address_line_1 || "",
            address_line_2: user.address_line_2 || "",
            city: user.city || "",
            postal_code: user.postal_code || "",
            profile_picture: null,
        });

    // Define formErrors state
    const [formErrors, setFormErrors] = useState({});
    const [isIC, setIsIC] = useState(false);
    const [documentType, setDocumentType] = useState('ic');
    const [icError, setIcError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsPostalCode, setSuggestionsPostalCode] = useState([]);

    

    const validateIC = (value) => {
        if (!/^\d{12}$/.test(value)) {
            return false;
        }

        const year = value.substring(0, 2);
        const month = parseInt(value.substring(2, 4));
        const day = parseInt(value.substring(4, 6));
        const gender = parseInt(value.substring(11, 12)) % 2 === 0 ? 'female' : 'male';

        // Validate month and day
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return false;
        }

        const fullYear = parseInt(year) > 23 ? `19${year}` : `20${year}`;
        const bornDate = `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        return {
            isValid: true,
            bornDate,
            gender,
            age: calculateAge(bornDate)
        };
    };

    const validatePassport = (value) => {
        return /^[A-Za-z0-9]+$/.test(value);
    };

    const handleChange = (field, inputValue) => {
        setData(field, inputValue);

        if (field === "email" && inputValue !== originalEmail) {
            checkEmailUniqueness(inputValue);
        } else if (field === "email" && inputValue === originalEmail) {
            setFormErrors((prevErrors) => {
                const { email, ...rest } = prevErrors;
                return rest;
            });
        }

        if (field === "ic_number") {
            const icValidation = validateIC(inputValue);
            if (icValidation) {
                const { fullYear, month, day } = icValidation;
                const birthDate = new Date(fullYear, month - 1, day);

                setData("born_date", birthDate.toISOString().split("T")[0]);
                setData("age", new Date().getFullYear() - fullYear);
                setIsIC(true);
            } else {
                setIsIC(false);
                setData("born_date", "");
                setData("age", "");
            }
        }
    };

    const handleManualInput = (field, inputValue) => {
        setData(field, inputValue);
        if (field === "born_date") {
            const birthYear = new Date(inputValue).getFullYear();
            setData("age", new Date().getFullYear() - birthYear);
        }
    };

    const checkEmailUniqueness = debounce(async (email) => {
        if (email === originalEmail) {
            setEmailError('');
            return;
        }
        
        try {
            const response = await axios.post(route("profile.checkEmail"), { email });
            if (response.data.exists) {
                setEmailError("This email is already registered. Please try to login or use a different email.");
                setError('email', 'Email already in use');
            } else {
                setEmailError('');
                clearErrors('email');
            }
        } catch (error) {
            console.error("Error checking email:", error);
        }
    }, 500);

    const checkICUniqueness = async (icNumber) => {
        try {
            const response = await axios.post(route("profile.checkIC"), { ic_number: icNumber });
            if (response.data.exists) {
                setIcError("This IC number is already registered in our system.");
                setError('ic_number', 'IC already registered');
                return false;
            } else {
                setIcError('');
                clearErrors('ic_number');
                return true;
            }
        } catch (error) {
            console.error("Error checking IC:", error);
            return false;
        }
    };

    const calculateAge = (bornDate) => {
        const today = new Date();
        const birthDate = new Date(bornDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    const handleICChange = async (e) => {
        const value = e.target.value;
        
        if (documentType === 'ic') {
            // Only allow numbers
            const numbersOnly = value.replace(/[^\d]/g, '');
            setData('ic_number', numbersOnly);
            
            if (numbersOnly.length === 12) {
                const icData = validateIC(numbersOnly);
                if (icData.isValid) {
                    // Check IC uniqueness before setting the data
                    const isUnique = await checkICUniqueness(numbersOnly);
                    if (isUnique) {
                        setData(data => ({
                            ...data,
                            born_date: icData.bornDate,
                            age: icData.age,
                            gender: icData.gender
                        }));
                        setIcError('');
                    }
                } else {
                    setIcError('Invalid IC format');
                    clearDependentFields();
                }
            } else if (numbersOnly.length > 0) {
                setIcError('IC must be 12 digits');
                clearDependentFields();
            }
        } else {
            // Passport: allow alphanumeric, no special characters
            const alphanumeric = value.replace(/[^A-Za-z0-9]/g, '');
            if (validatePassport(alphanumeric)) {
                setData('ic_number', alphanumeric);
                setIcError('');
            } else {
                setIcError('Only letters and numbers are allowed');
            }
        }
    };

    const clearDependentFields = () => {
        setData(data => ({
            ...data,
            born_date: '',
            age: '',
            gender: ''
        }));
    };

    const handleDocumentTypeChange = (type) => {
        setDocumentType(type);
        setData('ic_number', '');
        clearDependentFields();
        setIcError('');
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setData(data => ({
            ...data,
            born_date: newDate,
            age: calculateAge(newDate)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email before submission
        const emailError = validateEmail(data.email);
        if (emailError) {
            setError("email", emailError);
            alert('Please fix the email format before submitting.');
            return; // Prevent form submission
        }

        // Create FormData object
        const formData = new FormData();
        
        // Add method spoofing for Laravel
        formData.append('_method', 'PUT');
        
        // Add all form fields to FormData
        Object.keys(data).forEach(key => {
            if (data[key] != null) {
                if (key === 'profile_picture' && data[key] instanceof File) {
                    formData.append(key, data[key]);
                } else {
                    formData.append(key, data[key]);
                }
            }
        });

        try {
            // Submit using Inertia
            post(route('profile.update'), formData, {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    alert('Profile updated successfully!');
                },
                onError: (errors) => {
                    console.error('Form submission errors:', errors);
                    alert(Object.values(errors).flat()[0] || 'An error occurred while saving your profile');
                },
            });
        } catch (error) {
            console.error('Submission error:', error);
            alert('An error occurred while saving your profile');
        }
    };

    const userImage = data.profile_picture
        ? URL.createObjectURL(data.profile_picture)
        : auth.user.profile_picture
        ? `/storage/${auth.user.profile_picture}`
        : "https://ui-avatars.com/api/?name=User&background=random";

    const validateName = (firstName, lastName) => {
        if (firstName.toLowerCase() === lastName.toLowerCase()) {
            return "First name and last name cannot be the same";
        }
        return null;
    };

    const validateEmail = (email) => {
        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }
        
        // Check for valid domain extensions (.com, .my, etc.)
        const domainExtensionRegex = /\.[a-z]{2,}$/i;
        if (!domainExtensionRegex.test(email)) {
            return "Email must end with a valid domain (e.g., .com, .my)";
        }
        
        return null;
    };

    const validatePhone = (phone) => {
        // Remove all spaces and special characters for validation
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

        // Malaysian phone number patterns:
        // 1. Starting with 0: 01xxxxxxxx (10-11 digits total)
        // 2. Starting with +60: +60xxxxxxxxx (11-12 digits total)
        const malaysianPattern = /^(?:0|(\+?60))(?:1[0-46-9]\d{7,8}|[3-9]\d{7})$/;

        // International phone number pattern (for other countries)
        const internationalPattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;

        if (malaysianPattern.test(cleanPhone)) {
            return null; // Valid Malaysian number
        } else if (internationalPattern.test(cleanPhone)) {
            return null; // Valid international number
        }
        return "Please enter a valid phone number";
    };

    const handleNameChange = (field, value) => {
        setData(field, value);

        // Clear existing name error
        if (errors.nameMatch) {
            clearErrors("nameMatch");
        }

        // Validate names when either first name or last name changes
        const firstName = field === "firstname" ? value : data.firstname;
        const lastName = field === "lastname" ? value : data.lastname;

        if (firstName && lastName) {
            const nameError = validateName(firstName, lastName);
            if (nameError) {
                setError("nameMatch", nameError);
            }
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setData("email", value);

        // Clear existing email error
        clearErrors("email");

        if (value) {
            const emailError = validateEmail(value);
            if (emailError) {
                setError("email", emailError);
            } else if (value !== originalEmail) {
                // Only check uniqueness if email is valid and different from original
                checkEmailUniqueness(value);
            }
        } else {
            setError("email", "Email is required");
        }
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value;

        // Allow digits, +, spaces, hyphens
        value = value.replace(/[^\d\+\-\s]/g, "");

        // Format the value
        value = formatPhoneNumber(value);

        setData("phone", value);

        // Clear existing phone error
        if (errors.phone) {
            clearErrors("phone");
        }

        const phoneError = validatePhone(value);
        if (phoneError) {
            setError("phone", phoneError);
        }
    };

    const formatPhoneNumber = (value) => {
        // Remove all non-digit characters except + 
        let digits = value.replace(/[^\d+]/g, "");

        // Handle Malaysian numbers
        if (digits.startsWith('0')) {
            // Convert 01x format to +601x format
            digits = '+6' + digits;
        } else if (!digits.startsWith('+')) {
            // If no + or 0 prefix, assume it's a Malaysian number without prefix
            digits = '+60' + digits;
        }

        // Format based on country code
        if (digits.startsWith('+60')) {
            // Malaysian format: +60 12-3456789
            if (digits.length >= 12) {
                return digits.slice(0, 3) + " " + 
                       digits.slice(3, 5) + "-" + 
                       digits.slice(5);
            }
        } else {
            // Simple international format: +XX XXX-XXXXXXX
            if (digits.length >= 8) {
                const countryCode = digits.slice(0, 3);
                const areaCode = digits.slice(3, 6);
                const number = digits.slice(6);
                return `${countryCode} ${areaCode}-${number}`;
            }
        }

        return digits; // Return unformatted if no specific format matches
    };

    const handleAddressChange = (e) => {
        const { value } = e.target;
        setData({ ...data, address_line_1: value });
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

                setData({
                    ...data,
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

    useEffect(() => {
        if (data.profile_picture instanceof File) {
            const objectUrl = URL.createObjectURL(data.profile_picture);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [data.profile_picture]);

    // Add this function to validate file type and size
    const validateProfilePicture = (file) => {
        // Allowed file types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        
        // Max file size (2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes

        if (!allowedTypes.includes(file.type)) {
            alert('Only image files (JPG, PNG, GIF) are allowed');
            return false;
        }

        if (file.size > maxSize) {
            alert('File size must be less than 2MB');
            return false;
        }

        return true;
    };

    return (
        <>
            <Head title="Profile Edit" />
            <Header auth={auth} />

            <main className="flex flex-col md:flex-row pt-20 min-h-screen bg-gray-100">
                <UserSidebar />

                <div className="flex-1 flex justify-center p-6 md:p-12">
                    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 rounded shadow-lg">
                        <div className="col-span-1 text-center">
                            <div
                                className="w-32 h-32 rounded-full mx-auto bg-cover bg-center"
                              
                                style={{ 
                                    backgroundImage: `url(${userImage})`,
                                    backgroundPosition: 'center',
                                    backgroundSize: 'cover',
                                }}
                            ></div>
                            <label className="block mt-2 text-sm text-gray-600 cursor-pointer">
                                Edit Picture
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (validateProfilePicture(file)) {
                                                setData("profile_picture", file);
                                            } else {
                                                // Reset the input
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                />
                            </label>
                            <p className="text-lg font-semibold mt-4">{`${data.firstname} ${data.lastname}`}</p>
                            <p className="text-gray-600">{data.phone}</p>
                            <p className="text-gray-600">{data.email}</p>
                        </div>

                        <div className="col-span-2">
                            <h2 className="text-2xl font-semibold mb-6">
                                My Profile
                            </h2>
                            <form
                                onSubmit={handleSubmit}
                                encType="multipart/form-data"
                                className="space-y-6"
                            >
                                <input type="hidden" name="_token" value={csrf_token} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className={`mt-1 block w-full border rounded p-2 ${errors.nameMatch ? 'border-red-500' : ''}`}
                                            value={data.firstname}
                                            onChange={(e) =>
                                                handleNameChange(
                                                    "firstname",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.nameMatch && (
                                            <div className="text-red-500 text-sm">
                                                {errors.nameMatch}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.lastname}
                                            onChange={(e) =>
                                                handleNameChange(
                                                    "lastname",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.nameMatch && (
                                            <div className="text-red-500 text-sm">
                                                {errors.nameMatch}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            className={`mt-1 block w-full border rounded p-2 ${emailError ? 'border-red-500' : ''}`}
                                            value={data.email}
                                            onChange={handleEmailChange}
                                        />
                                        {emailError && (
                                            <p className="text-red-500 text-sm mt-1">{emailError}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Document Type</label>
                                        <div className="flex gap-4 mb-2">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    className="form-radio"
                                                    name="document_type"
                                                    value="ic"
                                                    checked={documentType === 'ic'}
                                                    onChange={() => handleDocumentTypeChange('ic')}
                                                />
                                                <span className="ml-2">IC Number</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    className="form-radio"
                                                    name="document_type"
                                                    value="passport"
                                                    checked={documentType === 'passport'}
                                                    onChange={() => handleDocumentTypeChange('passport')}
                                                />
                                                <span className="ml-2">Passport</span>
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            className={`mt-1 block w-full border rounded p-2 ${icError ? 'border-red-500' : ''}`}
                                            value={data.ic_number || ''}
                                            onChange={handleICChange}
                                            placeholder={documentType === 'ic' ? 'Enter 12 digit IC number' : 'Enter passport number'}
                                            maxLength={documentType === 'ic' ? 12 : undefined}
                                        />
                                        {icError && (
                                            <p className="text-red-500 text-sm mt-1">{icError}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.age || ""}
                                            onChange={(e) =>
                                                setData("age", e.target.value)
                                            }
                                            disabled={documentType === 'ic' && isIC}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Born Date
                                        </label>
                                        <input
                                            type="date"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.born_date || ''}
                                            onChange={handleDateChange}
                                            disabled={documentType === 'ic' && isIC}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Gender</label>
                                        <select
                                            className={`mt-1 block w-full border rounded p-2 ${errors.gender ? 'border-red-500' : ''}`}
                                            value={data.gender}
                                            onChange={(e) => setData("gender", e.target.value)}
                                            disabled={documentType === 'ic' && isIC}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.gender && (
                                            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.phone}
                                            onChange={handlePhoneChange}
                                        />
                                        {errors.phone && (
                                            <div className="text-red-500 text-sm">
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Address Line 1
                                        </label>
                                        <input
                                            type="text"
                                            name="address_line_1"
                                            placeholder="Address Line 1*"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.address_line_1}
                                            onChange={handleAddressChange}
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

                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Address Line 2
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            name="address_line_2"
                                            placeholder="Address Line 2"
                                            
                                            value={
                                                data.address_line_2
                                            }
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            name="city"
                                            placeholder="City*"
                                            value={data.city}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            name="postal_code"
                                            placeholder="Postal Code*"
                                            value={data.postal_code}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end mt-6">
                                    <button
                                        type="submit"
                                        className="bg-red-500 text-white px-6 py-2 rounded-full"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
