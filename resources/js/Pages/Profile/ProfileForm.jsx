import React, { useState, useEffect } from "react";
import { useForm, Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import RadioInput from "@/Components/RadioInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import axios from "axios";
import { debounce } from "lodash";


export default function ProfileForm({ auth, user }) {
    const { csrf_token } = usePage().props;
    const originalEmail = user.email;
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
    const [existingUsers, setExistingUsers] = useState([]);
    const userImage = data.profile_picture
        ? URL.createObjectURL(data.profile_picture)
        : auth.user.profile_picture
            ? `/storage/${auth.user.profile_picture}`
            : "https://ui-avatars.com/api/?name=User&background=random";
    const [documentType, setDocumentType] = useState('ic');
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const postalCodePatterns = {
        "United States": /^\d{5}(-\d{4})?$/,         // Example: 12345 or 12345-6789
        "Canada": /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/, // Example: A1B 2C3
        "United Kingdom": /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/, // Example: SW1A 1AA
        "Germany": /^\d{5}$/,                 // Example: 12345
        "Malaysia": /^\d{5}$/                 // Example: 25300
    };
    const [country, setCountry] = useState("Malaysia");

    useEffect(() => {
        axios
            .get("/api/existing-users")
            .then((response) => {
                setExistingUsers(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the existing users:", error);
            });
    }, []);

    const validateIC = (value) => {
        if (!/^\d{12}$/.test(value)) {
            return false;
        }

        const year = value.substring(0, 2);
        const month = parseInt(value.substring(2, 4), 10);
        const day = parseInt(value.substring(4, 6), 10);
        const gender = parseInt(value.substring(11, 12), 10) % 2 === 0 ? 'female' : 'male';

        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return false;
        }

        const fullYear = parseInt(year, 10) > 23 ? `19${year}` : `20${year}`;

        const bornDate = new Date(`${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);

        if (isNaN(bornDate.getTime()) || bornDate.getDate() !== day) {
            return false;
        }

        return {
            isValid: true,
            bornDate: bornDate.toISOString().split('T')[0], // Format: DD-MM-YYYY
            gender: gender,
            age: calculateAge(bornDate)
        };
    };

    const validatePassport = (value) => {
        return /^[A-Za-z0-9]+$/.test(value);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
        validateField(name, value);
    };

    const validateField = (field, value) => {
        switch (field) {
            case "firstname":
                const isExistingName = existingUsers.some((user) => user.firstname === (field === "firstname" ? value : data.firstname));
                if (data.lastname === value) {
                    setError("firstname", "First name and last name cannot be the same");
                } else if (isExistingName) {
                    setError("firstname", "This name has already been registered, please use a different name");
                } else if (value === "") {
                    setError("firstname", "First name is required");
                } else {
                    clearErrors("firstname");
                }
                break;
            case "lastname":
                if (data.firstname === value) {
                    setError("lastname", "First name and last name cannot be the same");
                } else if (value === "") {
                    setError("lastname", "Last name is required");
                } else {
                    clearErrors("lastname");
                }
                break;
            case "email":
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/i;
                const isExistingEmail = existingUsers.some((user) => user.email === value);
                if (!emailPattern.test(value)) {
                    setError("email", "Please enter a valid email address (e.g., user@example.com)");
                } else if (isExistingEmail) {
                    setError("email", "This email has already been registered, please use a different email");
                } else if (value !== originalEmail) {
                    const emailIsUnique = checkEmailUniqueness(value);
                    if (!emailIsUnique) {
                        setError("email", "Email already in use.");
                    } else {
                        clearErrors("email");
                    }
                } else if (value === "") {
                    setError("email", "Email is required");
                } else {
                    clearErrors("email");
                }
                break;
            case "document_type":
                setDocumentType(value);
                setData(data => ({
                    ...data,
                    ic_number: '',
                    born_date: '',
                    age: '',
                    gender: ''
                }));
                break;
            case "ic_number":
                clearErrors("ic_number");
                if (!checkICUniqueness(value)) {
                    setError("ic_number", "IC already registered");
                } else if (value.length == 12) {
                    const icValidation = validateIC(value);
                    if (icValidation) {
                        const { bornDate, gender, age } = icValidation;
                        setData((prevData) => ({
                            ...prevData,
                            born_date: bornDate,
                            gender: gender,
                            age: age,
                        }));
                        setDocumentType('ic');
                    } else {
                        setError('ic_number', "Please enter a valid ic.");
                    }
                } else if (value.length > 12) {
                    setDocumentType('passport');
                    if (!validatePassport(value)) {
                        setError('ic_number', "Please enter a valid passport.");
                    }
                } else {
                    setError('ic_number', "Please enter a valid identification code type.");
                }
                break;
            case "born_date":
                setData(data => ({
                    ...data,
                    born_date: value,
                    age: calculateAge(value)
                }));
                break;
            case "phone":
                let phoneValue = value.replace(/\D/g, '');
                if (value.startsWith('+')) {
                    phoneValue = '+' + phoneValue;
                }
                if (phoneValue.length > 0 && !validatePhone(phoneValue)) {
                    setError('phone', "Please enter a valid phone number");
                } else {
                    clearErrors("phone");
                }
                break;
            case "address_line_1":
                if (value.length > 2) {
                    fetchSuggestions(value, "address");
                } else {
                    setSuggestions([]);
                }
                break;
            case "postal_code":
                // if (postalCodePatterns[country] && !postalCodePatterns[country].test(e.target.value)) {
                //     setError("postal_code",`Invalid postal code format for ${country}`);
                // } else {
                //     clearErrors("postal_code");
                // }
                break;
        }
    }

    const checkEmailUniqueness = debounce(async (email) => {
        try {
            const response = await axios.post(route("profile.checkEmail"), { email });
            if (response.data.exists) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.error("Error checking email:", error);
        }
    }, 500);

    const checkICUniqueness = async (icNumber) => {
        try {
            const response = await axios.post(route("profile.checkIC"), { ic_number: icNumber });
            if (response.data.exists) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.error("Error checking IC:", error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                onSuccess: (page) => {
                    alert('Profile updated successfully!');
                    // Update the form data with the latest user data
                    setData(page.props.user);
                },
                onError: (errors) => {
                    console.error('Form submission errors:', errors);
                    if (errors) {
                        const errorMessage = Object.values(errors).flat()[0] || 'An error occurred while saving your profile';
                        alert(errorMessage);
                    }
                },
            });
        } catch (error) {
            console.error('Submission error:', error);
            alert('An error occurred while saving your profile');
        }
    };

    const validatePhone = (phone) => {
        // Remove any non-digits
        const cleanPhone = phone.replace(/\D/g, '');

        // Malaysian phone format: 01xxxxxxxx (10-11 digits)
        const myPhoneRegex = /^0[1][0-9]{8,9}$/;  // Starts with 01, followed by 8-9 digits

        // International format (if starts with '+')
        const intlPhoneRegex = /^\+(\d{1,3})(\d{4,14})$/;

        // If starts with '+', use international format, otherwise use Malaysian format
        if (phone.startsWith('+')) {
            return intlPhoneRegex.test(phone);
        }

        return myPhoneRegex.test(cleanPhone);
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

    const fetchSuggestions = async (query, type) => {
        try {
            setSuggestionsLoading(true);
            const response = await axios.get(`/api/proxy/nominatim?q=${encodeURIComponent(query)}`);
            setSuggestions(response.data);
            setSuggestionsLoading(false);
            //const url = `/api/place-autocomplete?query=${query}&type=${type}`;
            // const response = await fetch(url);
            // const data = await response.json();
            // console.log("data suggestion: ", data);

            // if (data.predictions && Array.isArray(data.predictions)) {
            //     if (type === "address") {
            //         const suggestions = data.predictions.map((prediction) => ({
            //             description: prediction.description,
            //             placeId: prediction.place_id,
            //             geometry: prediction.geometry,
            //         }));
            //         setSuggestions(suggestions);
            //     } else {
            //         setSuggestionsPostalCode(
            //             data.predictions.map(
            //                 (prediction) => prediction.description
            //             )
            //         );
            //     }
            // } else {
            //     if (type === "address") {
            //         setSuggestions([]);
            //     } else {
            //         setSuggestionsPostalCode([]);
            //     }
            // }
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
            setSuggestions([]);
        }
    };

    const handleSelect = (address) => {
        // Split the address by comma and remove any extra spaces
        let parts = address.split(',').map(part => part.trim());

        // Ensure we have at least 4 parts (city, state, postcode, country)
        if (parts.length < 4) return null;

        // Extract values from the back
        const country = parts.pop();
        const postcode = parts.pop();
        const state = parts.pop();
        const city = parts.pop();

        // Remaining parts are for address line 1 and 2
        const address1 = parts.slice(0, 3).join(', '); // First three (if available)
        const address2 = parts.slice(3).join(', ');    // Remaining ones

        setData(data => ({
            ...data,
            address_line_1: address1,
            address_line_2: address2,
            city: city,
            postal_code: postcode
        }));
        setSuggestions([]);
    };

    // const fetchPostalCode = async (placeId) => {
    //     try {
    //         const url = `/api/geocode?place_id=${placeId}`;
    //         const response = await fetch(url);
    //         const data = await response.json();
    //         console.log("data postal code: ", data);

    //         if (data.status === "OK" && data.results.length > 0) {
    //             const addressComponents = data.results[0].address_components;

    //             const streetNumber = addressComponents.find((component) =>
    //                 component.types.includes("street_number")
    //             );
    //             const streetAddress_1 = addressComponents.find((component) =>
    //                 component.types.includes("route")
    //             );
    //             const streetAddress_2 = addressComponents.find((component) =>
    //                 component.types.includes("sublocality")
    //             );
    //             const city = addressComponents.find((component) =>
    //                 component.types.includes("locality")
    //             );
    //             const country = addressComponents.find((component) =>
    //                 component.types.includes("country")
    //             );
    //             const postalCodeComponent = addressComponents.find(
    //                 (component) => component.types.includes("postal_code")
    //             );

    //             const { lat, lng } = data.results[0].geometry.location;
    //             const address_line_1 = streetNumber
    //                 ? `${streetNumber.long_name}, ${streetAddress_1 ? streetAddress_1.long_name : ""
    //                 }`
    //                 : streetAddress_1
    //                     ? streetAddress_1.long_name
    //                     : "";

    //             return {
    //                 address_line_1,
    //                 address_line_2: streetAddress_2
    //                     ? streetAddress_2.long_name
    //                     : "",
    //                 city: city ? city.long_name : "",
    //                 country: country ? country.long_name : "",
    //                 postalCode: postalCodeComponent
    //                     ? postalCodeComponent.long_name
    //                     : null,
    //                 lat,
    //                 lng,
    //             };
    //         }

    //         return null;
    //     } catch (error) {
    //         console.error("Error fetching postal code:", error);
    //         return null;
    //     }
    // };

    // const fetchPostalCodeFromGeonames = async (lat, lng) => {
    //     try {
    //         const username = "rems.com";
    //         const url = `http://api.geonames.org/findNearbyPostalCodesJSON?lat=${lat}&lng=${lng}&username=${username}`;

    //         const response = await fetch(url);
    //         const data = await response.json();
    //         // console.log("checking geonames")

    //         if (data.postalCodes && data.postalCodes.length > 0) {
    //             const postalInfo = data.postalCodes[0];
    //             return {
    //                 postalCode: postalInfo.postalCode,
    //                 placeName: postalInfo.placeName,
    //                 adminName1: postalInfo.adminName1,
    //             };
    //         }

    //         return null;
    //     } catch (error) {
    //         console.error("Error fetching postal code from Geonames:", error);
    //         return null;
    //     }
    // };

    // const onAddressSelect = async (suggestion) => {
    //     try {
    //         const googleResult = await fetchPostalCode(suggestion.placeId);

    //         if (googleResult) {
    //             const {
    //                 lat,
    //                 lng,
    //                 postalCode,
    //                 address_line_1,
    //                 address_line_2,
    //                 city,
    //                 country,
    //             } = googleResult;

    //             let postalInfo = postalCode
    //                 ? { postalCode }
    //                 : await fetchPostalCodeFromGeonames(lat, lng);

    //             setData({
    //                 ...data,
    //                 address_line_1,
    //                 address_line_2,
    //                 city,
    //                 country,
    //                 postal_code: postalInfo?.postalCode || postalCode || "",
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error selecting address:", error);
    //     }

    //     setSuggestions([]);
    // };

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
        <AuthenticatedLayout>
            <Head title={"Main"} />

            <div className="flex-1 flex justify-center p-6 ">
                <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                    <div className="md:col-span-1 text-center">
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
                                            e.target.value = '';
                                        }
                                    }
                                }}
                            />
                        </label>
                        <p className="text-lg font-semibold mt-4">{`${data.firstname || ''} ${data.lastname || ''}`}</p>
                        <p className="text-gray-600">{data.phone}</p>
                        <p className="text-gray-600">{data.email}</p>
                    </div>

                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-semibold mb-6">
                            Personal Info
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            <input type="hidden" name="_token" value={csrf_token} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="firstname" value="First Name" className="mt-4" />
                                    <TextInput
                                        id="firstname"
                                        name="firstname"
                                        value={data.firstname}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.firstname}
                                        className="text-red-500"
                                    />
                                </div>
                                <div >
                                    <InputLabel htmlFor="lastname" value="Last Name" className="mt-4" />
                                    <TextInput
                                        id="lastname"
                                        name="lastname"
                                        value={data.lastname}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.lastname}
                                        className="text-red-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div >
                                    <InputLabel htmlFor="email" value="Email" className="mt-4" />
                                    <TextInput
                                        id="email"
                                        type="text"
                                        inputMode="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="text-red-500"
                                    />
                                </div>

                                <div >
                                    <div className="flex gap-4 mb-2 mt-4 block font-medium text-sm text-gray-700 dark:text-gray-300">
                                        <label value="Document Type" className="" >Document Type:
                                            <label className="inline-flex items-center ml-2">
                                                <RadioInput
                                                    id="document_type_ic"
                                                    name="document_type"
                                                    value="ic"
                                                    checked={documentType === 'ic'}
                                                    onChange={handleChange}
                                                />
                                                <span className="ml-2">IC</span>
                                            </label>
                                            <label className="inline-flex items-center ml-2">
                                                <RadioInput
                                                    id="document_type_passport"
                                                    name="document_type"
                                                    value="passport"
                                                    checked={documentType === 'passport'}
                                                    onChange={handleChange}
                                                />
                                                <span className="ml-2">Passport</span>
                                            </label>
                                        </label>
                                    </div>
                                    <TextInput
                                        id="ic_number"
                                        name="ic_number"
                                        value={data.ic_number}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        onChange={(e) => {
                                            setData({ ...data, ic_number: e.target.value });
                                        }}
                                        onBlur={handleChange}
                                    />
                                    <InputError
                                        message={errors.ic_number}
                                        className="text-red-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div >
                                    <InputLabel htmlFor="age" value="Age" className="mt-4" />
                                    <TextInput
                                        id="age"
                                        name="age"
                                        type="number"
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        value={data.age || ""}
                                        onChange={(e) => setData("age", e.target.value)}
                                    />
                                    <InputError
                                        message={errors.age}
                                        className="text-red-500"
                                    />
                                </div>

                                <div >
                                    <InputLabel htmlFor="born_date" value="Birth Date" className="mt-4" />
                                    <TextInput
                                        id="born_date"
                                        name="born_date"
                                        type="date"
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        value={data.born_date || ''}
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={errors.born_date}
                                        className="text-red-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div >
                                    <InputLabel htmlFor="gender" value="Gender" className="mt-4" />
                                    <select
                                        id="gender"
                                        name="gender"
                                        className={`mt-1 block w-full border rounded p-2`}
                                        value={data.gender}
                                        onChange={(e) => setData("gender", e.target.value)}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    <InputError
                                        message={errors.gender}
                                        className="text-red-500"
                                    />
                                </div>

                                <div >
                                    <InputLabel htmlFor="phone" value="Phone Number" className="mt-4" />
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        className="mt-1 block w-full border rounded p-2"
                                        value={data.phone}
                                        onChange={handleChange}
                                        onBlur={(e) => { setData("phone", formatPhoneNumber(e.target.value)) }}
                                    />
                                    <InputError
                                        message={errors.phone}
                                        className="text-red-500"
                                    />
                                </div>

                            </div>
                            <div className=" relative grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div >
                                    <InputLabel htmlFor="address_line_1" value="Address 1" className="mt-4" />
                                    <TextInput
                                        id="address_line_1"
                                        name="address_line_1"
                                        type="text"
                                        placeholder="Address Line 1*"
                                        className="mt-1 block w-full border rounded p-2"
                                        value={data.address_line_1}
                                        onChange={handleChange}
                                    />
                                    {/* Display address suggestions */}
                                    {suggestionsLoading && (
                                        <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg p-2 animate-pulse">
                                            <li className="p-2 bg-gray-300 rounded">Loading...</li>
                                            <li className="p-2 bg-gray-200 rounded mt-1">Loading...</li>
                                            <li className="p-2 bg-gray-100 rounded mt-1">Loading...</li>
                                        </ul>
                                    )}
                                    {suggestions.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow-lg">
                                            {suggestions.map(
                                                (suggestion, index) => (
                                                    <li
                                                        key={index}
                                                        onClick={() => handleSelect(suggestion.display_name)}
                                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <div className="font-bold">
                                                            {suggestion.display_name}
                                                        </div>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    )}
                                    <InputError
                                        message={errors.address_line_1}
                                        className="text-red-500"
                                    />
                                </div>

                                <div >
                                    <InputLabel htmlFor="address_line_2" value="Address 2" className="mt-4" />
                                    <TextInput
                                        id="address_line_2"
                                        name="address_line_2"
                                        type="text"
                                        className="mt-1 block w-full border rounded p-2"
                                        placeholder="Address Line 2"
                                        value={data.address_line_2}
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={errors.address_line_2}
                                        className="text-red-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div >
                                <InputLabel htmlFor="city" value="City" className="mt-4" />
                                <TextInput
                                        id="city"
                                        name="city"
                                        type="text"
                                        className="mt-1 block w-full border rounded p-2"
                                        placeholder="City Name"
                                        value={data.city}
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={errors.city}
                                        className="text-red-500"
                                    />
                                </div>
                                {/* <div >
                                    <label className="block text-gray-700">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border rounded p-2"
                                        name="postal_code"
                                        placeholder="Postal Code*"
                                        value={data.postal_code}
                                        onChange={handleChange}
                                    />
                                </div> */}
                                <div >
                                <InputLabel htmlFor="postal_code" value="Postal Code" className="mt-4" />
                                <TextInput
                                        id="postal_code"
                                        name="postal_code"
                                        type="text"
                                        className="mt-1 block w-full border rounded p-2"
                                        placeholder="Postal Code"
                                        value={data.postal_code}
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={errors.postal_code}
                                        className="text-red-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end mt-6">
                                <PrimaryButton
                                    type="submit"
                                    className="bg-red-500 text-white px-6 py-2 rounded-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Saving..."
                                        : "Save Changes"}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
