import React, { useState } from "react";
import { useForm, Head } from "@inertiajs/react";
import Header from "@/Components/HeaderMenu";
import UserSidebar from "@/Components/UserSidebar";
import axios from "axios";
import { debounce } from 'lodash';

export default function Profile({ auth, user }) {
    const originalEmail = user.email; // Define the original email here
    const { 
        data, 
        setData, 
        processing, 
        errors, 
        setError,
        clearErrors 
    } = useForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        ic_number: user.ic_number || "",
        age: user.age || "",
        born_date: user.born_date || "",
        phone: user.phone || "",
        address_line_1: user.address_line_1 || "",
        address_line_2: user.address_line_2 || "",
        city: user.city || "",
        postal_code: user.postal_code || "",
        profile_picture: null,
    });

     // Define formErrors state
     const [formErrors, setFormErrors] = useState({});
     const [isIC, setIsIC] = useState(false);
 
     const validateFields = (field, value) => {
         let errors = { ...formErrors };
 
         if (field === "firstname" || field === "lastname") {
             if (data.firstname === data.lastname) {
                 errors["nameMatch"] = "First name and last name cannot be the same.";
             } else {
                 delete errors["nameMatch"];
             }
         }
 
         if (field === "age") {
             const age = parseInt(value);
             if (age < 1 || age > 100) {
                 errors["age"] = "Age must be between 1 and 100.";
             } else {
                 delete errors["age"];
             }
         }
 
         if (field === "phone" && /\D/.test(value)) {
             errors["phone"] = "Phone number can only contain digits.";
         } else {
             delete errors["phone"];
         }
 
         setFormErrors(errors);
     };
 
     const validateIC = (value) => {
         const icRegex = /^\d{6}\d{6}$/; // Example: YYMMDDXXXXXX
         if (icRegex.test(value)) {
             const year = parseInt(value.substring(0, 2), 10);
             const month = parseInt(value.substring(2, 4), 10);
             const day = parseInt(value.substring(4, 6), 10);
 
             if (month < 1 || month > 12 || day < 1 || day > 31) {
                 return false; // Invalid date in IC
             }
 
             const currentYear = new Date().getFullYear();
             const fullYear = year > parseInt(String(currentYear).substring(2)) ? 1900 + year : 2000 + year;
 
             return { fullYear, month, day };
         }
         return false;
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

    const checkEmailUniqueness = async (email) => {
        try {
            const response = await axios.post(route("profile.checkEmail"), { email });
            if (response.data.exists) {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    email: "This email is already registered. Please use a different email.",
                }));
            } else {
                setFormErrors((prevErrors) => {
                    const { email, ...rest } = prevErrors;
                    return rest;
                });
            }
        } catch (error) {
            console.error("Error checking email uniqueness:", error);
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

    const handleICorPassport = (e) => {
        const value = e.target.value;
        console.log("Function called with value:", value);

        // Update the IC number field directly without any conditions to allow user input
        setData("ic_number", value);

        // Remove hyphens for validation
        const cleanedValue = value.replace(/-/g, '');

        // Check if the input resembles an IC or passport number
        const isICFormat = /^\d{12}$/.test(cleanedValue); // 12 digits, no hyphens
        const isPassportFormat = /^[A-Z]\d{7,8}$/.test(value); // Alphanumeric passport

        if (isICFormat || isPassportFormat) {
            console.log(isICFormat ? "Detected IC format" : "Detected Passport format");
            setIsIC(isICFormat);

            // Check if the input resembles an IC format (12 numeric characters)
            if (isICFormat) {
                // Parse IC format to extract birth year, month, and day
                const year = parseInt(value.slice(0, 2), 10);
                const month = parseInt(value.slice(2, 4), 10);
                const day = parseInt(value.slice(4, 6), 10);

                const currYear = new Date().getFullYear();
                const currYear_cutoff = currYear % 100; // get the last two digit of current year.
                const birthYear = year > currYear_cutoff ? 1900 + year : 2000 + year;
                const birthDate = new Date(birthYear, month - 1, day + 1);
                const formattedDate = birthDate.toISOString().split("T")[0]; // YYYY-MM-DD format

                console.log("Birth Date Calculated:", formattedDate);
    
                // Update state
                setData((prevData) => ({
                    ...prevData,
                    born_date: formattedDate,
                    age: currYear - birthYear,
                }));
            }
        } else {
            console.log("Invalid format. Not an IC or Passport number.");
        }
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

        if (data.firstname === data.lastname) {
            alert("First name and last name cannot be the same.");
            return;
        }

        post(route("profile.update"), {
            onSuccess: () => {
                window.location.reload();
            },
        });
        
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }
        if (!email.toLowerCase().endsWith('.com')) {
            return "Email must end with .com";
        }
        return null;
    };

    const validatePhone = (phone) => {
        // Adjust regex based on your country's phone format
        const phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
        if (!phoneRegex.test(phone)) {
            return "Please enter a valid phone number format";
        }
        return null;
    };

    const handleNameChange = (field, value) => {
        setData(field, value);
        
        // Clear existing name error
        if (errors.nameMatch) {
            clearErrors('nameMatch');
        }
        
        // Validate names when either first name or last name changes
        const firstName = field === 'firstname' ? value : data.firstname;
        const lastName = field === 'lastname' ? value : data.lastname;
        
        if (firstName && lastName) {
            const nameError = validateName(firstName, lastName);
            if (nameError) {
                setError('nameMatch', nameError);
            }
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setData('email', value);
        
        // Clear existing email error
        if (errors.email) {
            clearErrors('email');
        }
        
        const emailError = validateEmail(value);
        if (emailError) {
            setError('email', emailError);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setData('phone', value);
        
        // Clear existing phone error
        if (errors.phone) {
            clearErrors('phone');
        }
        
        const phoneError = validatePhone(value);
        if (phoneError) {
            setError('phone', phoneError);
        }
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
                                style={{ backgroundImage: `url(${userImage})` }}
                            ></div>
                            <label className="block mt-2 text-sm text-gray-600 cursor-pointer">
                                Edit Picture
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setData("profile_picture", e.target.files[0])}
                                />
                            </label>
                            <p className="text-lg font-semibold mt-4">{`${data.firstname} ${data.lastname}`}</p>
                            <p className="text-gray-600">{data.phone}</p>
                            <p className="text-gray-600">{data.email}</p>
                        </div>

                        <div className="col-span-2">
                            <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.firstname}
                                            onChange={(e) => handleNameChange("firstname", e.target.value)}
                                        />
                                        {errors.nameMatch && (
                                            <div className="text-red-500 text-sm">{errors.nameMatch}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.lastname}
                                            onChange={(e) => handleNameChange("lastname", e.target.value)}
                                        />
                                        {errors.nameMatch && (
                                            <div className="text-red-500 text-sm">{errors.nameMatch}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.email}
                                            onChange={handleEmailChange}
                                        />
                                        {errors.email && (
                                            <div className="text-red-500 text-sm">{errors.email}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">IC Number / Passport</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.ic_number || ''}
                                            onChange={handleICorPassport}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Age</label>
                                        <input
                                            type="number"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.age || ''}
                                            onChange={(e) => setData("age", e.target.value)}
                                            disabled={isIC}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Born Date</label>
                                        <input
                                            type="date"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.born_date || ''}
                                            onChange={handleDateChange}
                                            disabled={isIC}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Phone Number</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.phone}
                                            onChange={handlePhoneChange}
                                        />
                                        {errors.phone && (
                                            <div className="text-red-500 text-sm">{errors.phone}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Address Line 1</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.address_line_1}
                                            onChange={(e) => setData("address_line_1", e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Address Line 2</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.address_line_2}
                                            onChange={(e) => setData("address_line_2", e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">City</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.city}
                                            onChange={(e) => setData("city", e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Postal Code</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.postal_code}
                                            onChange={(e) => setData("postal_code", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end mt-6">
                                    <button
                                        type="submit"
                                        className="bg-orange-500 text-white px-6 py-2 rounded-full"
                                        disabled={processing}
                                    >
                                        {processing ? "Saving..." : "Save Changes"}
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
