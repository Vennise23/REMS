import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import debounce from "lodash/debounce";
import "./EditUserModal.css";

const EditUserModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        firstname: user?.firstname || "",
        lastname: user?.lastname || "",
        email: user?.email || "",
        idType: user?.ic_number ? "ic" : "passport",
        ic_number: user?.ic_number || "",
        passport: user?.passport || "",
        age: user?.age?.toString() || "",
        gender: user?.gender || "",
        born_date: user?.born_date || "",
        phone: user?.phone || "",
        address_line_1: user?.address_line_1 || "",
        address_line_2: user?.address_line_2 || "",
        city: user?.city || "",
        postal_code: user?.postal_code || "",
        role: user?.role || "user",
        password: "",
        confirmPassword: "",
        profile_picture: null,
    });

    const [errors, setErrors] = useState({});
    const [profilePreview, setProfilePreview] = useState(
        user.profile_picture_url || null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingUnique, setIsCheckingUnique] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsPostalCode, setSuggestionsPostalCode] = useState([]);

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    // Reset form data when user prop changes
    useEffect(() => {
        if (user) {
            setFormData({
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                email: user.email || "",
                idType: user.ic_number ? "ic" : "passport",
                ic_number: user.ic_number || "",
                passport: user.passport || "",
                age: user.age?.toString() || "",
                gender: user.gender || "",
                born_date: user.born_date || "",
                phone: user.phone || "",
                address_line_1: user.address_line_1 || "",
                address_line_2: user.address_line_2 || "",
                city: user.city || "",
                postal_code: user.postal_code || "",
                role: user.role || "user",
                password: "",
                confirmPassword: "",
                profile_picture: null,
            });
            setProfilePreview(user.profile_picture_url || null);
        }
    }, [user]);

    // Validation functions
    const validateName = async (firstname, lastname) => {
        // Skip validation if names haven't changed
        if (firstname === user.firstname && lastname === user.lastname) {
            return true;
        }

        try {
            const response = await fetch("/api/check-name", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    user_id: user.id,
                }),
            });

            const data = await response.json();

            if (!data.available) {
                setErrors((prev) => ({
                    ...prev,
                    nameCombo: "This name combination already exists",
                }));
                return false;
            }
            return true;
        } catch (error) {
            console.error("Name validation error:", error);
            setErrors((prev) => ({
                ...prev,
                nameCombo: "Error checking name availability",
            }));
            return false;
        }
    };

    const validateEmail = (email, skipValidation = false) => {
        // Skip validation if email hasn't changed
        if (skipValidation || email === user.email) {
            return true;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[com]+$/;
        if (!emailRegex.test(email)) {
            setErrors((prev) => ({
                ...prev,
                email: "Invalid email format. Must contain @ and end with .com",
            }));
            return false;
        }
        return true;
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

    const validateIC = (ic) => {
        if (ic === user.ic_number) return true;
        return /^\d{12}$/.test(ic);
    };

    const validatePassport = (passport) => {
        return /^[A-Za-z0-9]+$/.test(passport);
    };

    const handleInputChange = async (e) => {
        const { name, value } = e.target;

        switch(name) {
            case 'firstname':
            case 'lastname':
                const newFirstname = name === 'firstname' ? value : formData.firstname;
                const newLastname = name === 'lastname' ? value : formData.lastname;
                
                setFormData(prev => ({ ...prev, [name]: value }));

                // Check if names are the same
                if (newFirstname && newLastname && 
                    newFirstname.toLowerCase() === newLastname.toLowerCase()) {
                    setErrors(prev => ({
                        ...prev,
                        firstname: 'First name and last name cannot be the same',
                        lastname: 'First name and last name cannot be the same'
                    }));
                    return;
                }

                // Clear name-related errors
                setErrors(prev => ({
                    ...prev,
                    firstname: '',
                    lastname: '',
                    nameCombo: ''
                }));

                // Only check uniqueness if both names are filled
                if (newFirstname && newLastname) {
                    try {
                        console.log('Checking names:', { newFirstname, newLastname, user_id: user.id });
                        const response = await axios.post('/api/check-name', {
                            firstname: newFirstname,
                            lastname: newLastname,
                            user_id: user.id
                        });
                        
                        console.log('Name check response:', response.data); // Debug response
                        
                        if (!response.data.available) {
                            setErrors(prev => ({
                                ...prev,
                                nameCombo: 'This name combination is already registered'
                            }));
                        }
                    } catch (error) {
                        console.error('Error checking name:', error);
                    }
                }
                break;

            case 'email':
                setFormData(prev => ({ ...prev, [name]: value }));
                
                // Comprehensive email validation regex
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                
                if (!value) {
                    setErrors(prev => ({
                        ...prev,
                        email: 'Email is required'
                    }));
                    return;
                }

                if (!emailRegex.test(value)) {
                    setErrors(prev => ({
                        ...prev,
                        email: 'Please enter a valid email address, must have @ and .com/.my/..'
                    }));
                    return;
                }

                // Skip uniqueness check if value is same as original
                if (value === user.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                    return;
                }

                try {
                    const response = await axios.post('/api/check-email-availability', {
                        email: value,
                        user_id: user.id // Include user_id to exclude current user
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                        }
                    });
                    
                    if (!response.data.available) {
                        setErrors(prev => ({ ...prev, email: 'This email is already in use' }));
                    } else {
                        setErrors(prev => ({ ...prev, email: '' }));
                    }
                } catch (error) {
                    console.error('Email check error:', error);
                    setErrors(prev => ({ 
                        ...prev, 
                        email: 'Error checking email availability' 
                    }));
                }
                break;

                case 'phone':
                    // Allow only digits and + at the start
                    const phoneValue = value.replace(/[^\d+]/g, '');
                    setFormData(prev => ({ ...prev, [name]: phoneValue }));
                    
                    if (!validatePhone(phoneValue)) {
                        setErrors(prev => ({
                            ...prev,
                            phone: 'Please enter a valid phone number'
                        }));
                    } else {
                        setErrors(prev => ({ ...prev, phone: '' }));
                    }
                    break;
                

            case 'ic_number':
                // Only allow numbers and limit to 12 digits
                const icValue = value.replace(/[^0-9]/g, '').slice(0, 12);
                setFormData(prev => ({ ...prev, [name]: icValue }));
                
                // Auto-fill when IC number is complete
                if (icValue.length === 12) {
                    // Extract date of birth (first 6 digits: YYMMDD)
                    const year = parseInt(icValue.substring(0, 2));
                    const month = icValue.substring(2, 4);
                    const day = icValue.substring(4, 6);
                    
                    // Determine century (assuming 00-29 is 2000s, 30-99 is 1900s)
                    const fullYear = year + (year < 30 ? 2000 : 1900);
                    
                    // Format birth date
                    const birthDate = `${fullYear}-${month}-${day}`;
                    
                    // Calculate age
                    const today = new Date();
                    const birth = new Date(birthDate);
                    let age = today.getFullYear() - birth.getFullYear();
                    const monthDiff = today.getMonth() - birth.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                        age--;
                    }
                    
                    // Determine gender (12th digit: odd = male, even = female)
                    const gender = parseInt(icValue.charAt(11)) % 2 === 0 ? 'female' : 'male';
                    
                    setFormData(prev => ({
                        ...prev,
                        born_date: birthDate,
                        age: age.toString(),
                        gender: gender
                    }));
                }
                
                // Validate format when length is 12
                if (icValue.length === 12) {
                    const icRegex = /^\d{12}$/;
                    if (!icRegex.test(icValue)) {
                        setErrors(prev => ({
                            ...prev,
                            ic_number: 'IC must contain exactly 12 numbers'
                        }));
                        return;
                    }

                    // Check uniqueness if format is valid
                    try {
                        const response = await axios.post('/api/check-ic-availability', {
                            ic_number: icValue,
                            user_id: user.id
                        });

                        if (!response.data.available) {
                            setErrors(prev => ({
                                ...prev,
                                ic_number: 'This IC number is already registered'
                            }));
                        } else {
                            setErrors(prev => ({ ...prev, ic_number: '' }));
                        }
                    } catch (error) {
                        console.error('IC check error:', error);
                    }
                } else {
                    setErrors(prev => ({
                        ...prev,
                        ic_number: 'IC must be 12 digits'
                    }));
                }
                break;

            case 'passport':
                const passportValue = value.replace(/[^a-zA-Z0-9]/g, '');
                setFormData(prev => ({ ...prev, [name]: passportValue }));
                break;

            case 'password':
                setFormData(prev => ({ ...prev, [name]: value }));
                if (value && value.length < 8) {
                    setErrors(prev => ({
                        ...prev,
                        password: 'Password must be at least 8 characters'
                    }));
                } else {
                    setErrors(prev => ({ ...prev, password: '' }));
                }
                break;

            case 'confirmPassword':
                setFormData(prev => ({ ...prev, [name]: value }));
                if (value !== formData.password) {
                    setErrors(prev => ({
                        ...prev,
                        confirmPassword: 'Passwords do not match'
                    }));
                } else {
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }
                break;

            case 'age':
                if (formData.idType === 'passport') {
                    const ageValue = value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, [name]: ageValue }));
                }
                break;

            case 'born_date':
                if (formData.idType === 'passport') {
                    setFormData(prev => ({ ...prev, [name]: value }));
                }
                break;

            case 'gender':
                if (formData.idType === 'passport') {
                    setFormData(prev => ({ ...prev, [name]: value }));
                }
                break;

            default:
                setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleIdTypeChange = (e) => {
        const newIdType = e.target.value;
        setFormData((prev) => ({
            ...prev,
            idType: newIdType,
            ic_number: "",
            passport: "",
            // Only reset these fields if switching to passport
            age: newIdType === "passport" ? "" : prev.age,
            born_date: newIdType === "passport" ? "" : prev.born_date,
            gender: newIdType === "passport" ? "" : prev.gender,
        }));
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }
        return age;
    };

    const handleAddressChange = (e) => {
      const { value } = e.target;
      setFormData({ ...formData, address_line_1: value });
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
                  const suggestions = data.predictions.map(
                      (prediction) => ({
                          description: prediction.description,
                          placeId: prediction.place_id,
                          geometry: prediction.geometry,
                      })
                  );
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
              const addressComponents =
                  data.results[0].address_components;

              const streetNumber = addressComponents.find((component) =>
                  component.types.includes("street_number")
              );
              const streetAddress_1 = addressComponents.find(
                  (component) => component.types.includes("route")
              );
              const streetAddress_2 = addressComponents.find(
                  (component) => component.types.includes("sublocality")
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
          console.error(
              "Error fetching postal code from Geonames:",
              error
          );
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

              setFormData({
                  ...formData,
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, profile_picture: 'Please select an image file' }));
                return;
            }
            setFormData(prev => ({ ...prev, profile_picture: file }));
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setProfilePreview(previewUrl);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        console.log('Save button clicked');
        
        // Log the exact user we're trying to update
        console.log('Attempting to update user:', {
            id: user.id,
            name: user.firstname,
            current_role: user.role
        });

        try {
            setIsSubmitting(true);
            const formDataToSend = new FormData();

            // First, explicitly set the user ID
            formDataToSend.append('id', user.id);

            // Add changed fields
            Object.keys(formData).forEach(key => {
                // Only append if the value has changed
                if (formData[key] !== user[key]) {
                    if (key === 'profile_picture' && formData[key] instanceof File) {
                        formDataToSend.append('profile_picture', formData[key]);
                    } else if (formData[key] !== null && formData[key] !== undefined) {
                        formDataToSend.append(key, formData[key]);
                        console.log(`Appending changed field: ${key} = ${formData[key]}`);
                    }
                }
            });

            // Log the final form data being sent
            for (let pair of formDataToSend.entries()) {
                console.log('FormData entry:', pair[0], pair[1]);
            }

            const response = await axios.post(`/api/users/${user.id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-HTTP-Method-Override': 'PUT'
                }
            });

            console.log('Response:', response.data);

            if (response.status === 200) {
                onUpdate(); // Refresh the user list
                onClose(); // Close the modal
                alert(`Successfully updated user ${user.firstname} (ID: ${user.id})`);
            }
        } catch (error) {
            console.error('Update error:', {
                userId: user.id,
                error: error.response?.data || error.message
            });
            alert(`Error updating user ${user.firstname} (ID: ${user.id}). Please check console.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Basic frontend validation
        if (formData.firstname && formData.firstname.length < 2) {
            newErrors.firstname = "First name must be at least 2 characters";
        }

        if (formData.lastname && formData.lastname.length < 2) {
            newErrors.lastname = "Last name must be at least 2 characters";
        }

        if (
            formData.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Please enter a valid email address";
        }

        if (
            formData.phone &&
            !/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/.test(formData.phone)
        ) {
            newErrors.phone = "Please enter a valid phone number";
        }

        if (formData.password) {
            if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        if (
            formData.ic_number &&
            !/^\d{12}$/.test(formData.ic_number.replace(/[-]/g, ""))
        ) {
            newErrors.ic_number = "Please enter a valid IC number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;

        
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="modal">
                <div className="modal-content">
                    <span className="close" onClick={onClose}>
                        &times;
                    </span>
                    <h2 className="modal-title">Edit User</h2>
                    <form
                        onSubmit={handleSave}
                        className="grid grid-cols-2 gap-4"
                    >
                        {/* First Row - Name Fields */}
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleInputChange}
                                className={`w-full ${
                                    errors.firstname || errors.nameCombo
                                        ? "border-red-500"
                                        : ""
                                }`}
                            />
                            {errors.firstname && (
                                <span className="text-red-500 text-sm">
                                    {errors.firstname}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleInputChange}
                                className={`w-full ${
                                    errors.lastname || errors.nameCombo
                                        ? "border-red-500"
                                        : ""
                                }`}
                            />
                            {errors.lastname && (
                                <span className="text-red-500 text-sm">
                                    {errors.lastname}
                                </span>
                            )}
                        </div>

                        {/* Show name combination error if exists */}
                        {errors.nameCombo && (
                            <div className="col-span-2">
                                <span className="text-red-500 text-sm">
                                    {errors.nameCombo}
                                </span>
                            </div>
                        )}

                        {/* Second Row - Email and Phone */}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full ${
                                    errors.email ? "border-red-500" : ""
                                }`}
                            />
                            {errors.email && (
                                <span className="text-red-500 text-sm">
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`w-full ${
                                    errors.phone ? "border-red-500" : ""
                                }`}
                            />
                            {errors.phone && (
                                <span className="text-red-500 text-sm">
                                    {errors.phone}
                                </span>
                            )}
                        </div>

                        {/* Third Row - ID Type Selection */}
                        <div className="form-group col-span-2">
                            <label className="block mb-2">Document Type</label>
                            <div className="flex space-x-4 mb-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="idType"
                                        value="ic"
                                        checked={formData.idType === "ic"}
                                        onChange={handleIdTypeChange}
                                        className="form-radio h-4 w-4 text-blue-600 rounded-full"
                                    />
                                    <span className="ml-2">IC Number</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="idType"
                                        value="passport"
                                        checked={formData.idType === "passport"}
                                        onChange={handleIdTypeChange}
                                        className="form-radio h-4 w-4 text-blue-600 rounded-full"
                                    />
                                    <span className="ml-2">Passport</span>
                                </label>
                            </div>
                        </div>

                        {/* Fourth Row - ID Number Field */}
                        <div className="form-group col-span-2">
                            {formData.idType === "ic" ? (
                                <div>
                                    <label>IC Number</label>
                                    <input
                                        type="text"
                                        name="ic_number"
                                        value={formData.ic_number}
                                        onChange={handleInputChange}
                                        className={`w-full ${
                                            errors.ic_number
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    {errors.ic_number && (
                                        <span className="text-red-500 text-sm">
                                            {errors.ic_number}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label>Passport Number</label>
                                    <input
                                        type="text"
                                        name="passport"
                                        value={formData.passport}
                                        onChange={handleInputChange}
                                        className={`w-full ${
                                            errors.passport
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    {errors.passport && (
                                        <span className="text-red-500 text-sm">
                                            {errors.passport}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Fifth Row - Gender, Age */}
                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                name="gender"
                                value={formData.gender || ''}
                                onChange={handleInputChange}
                                className={`w-full ${errors.gender ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select Gender</option>
                                {genderOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.gender && (
                                <span className="text-red-500 text-sm">{errors.gender}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Age</label>
                            <input
                                type="text"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                disabled={formData.idType === "ic"}
                                className="w-full"
                            />
                        </div>

                        {/* Sixth Row - Born Date and Role */}
                        <div className="form-group">
                            <label>Born Date</label>
                            <input
                                type="date"
                                name="born_date"
                                value={formData.born_date}
                                onChange={handleInputChange}
                                disabled={formData.idType === "ic"}
                                className="w-full"
                            />
                        </div>

                        <div className="form-group">
                            <label>Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="seller">Seller</option>
                            </select>
                        </div>

                        {/* Seventh Row - Address Line 1 and 2 */}
                        <div className="form-group col-span-2">
                            <label>Address Line 1</label>
                            <input
                                type="text"
                                name="address_line_1"
                                placeholder="Address Line 1*"
                                value={formData.address_line_1}
                                onChange={handleAddressChange}
                                className="w-full"
                            />
                            {/* Display address suggestions */}
                            {suggestions.length > 0 && (
                                <ul className="suggestions-list absolute bg-white border border-gray-300 w-full max-h-40 overflow-auto z-10">
                                    {suggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            onClick={() =>
                                                onAddressSelect(suggestion)
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
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="form-group col-span-2">
                            <label>Address Line 2</label>
                            <input
                                type="text"
                                name="address_line_2"
                                placeholder="Address Line 2"
                                value={
                                formData.address_line_2
                                }
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </div>

                        {/* Eighth Row - City and Postal Code */}
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                placeholder="City*"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </div>

                        <div className="form-group">
                            <label>Postal Code</label>
                            <input
                                type="text"
                                name="postal_code"
                                placeholder="Postal Code*"
                                value={formData.postal_code}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </div>

                        {/* Ninth Row - Password and Profile Picture */}
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full ${
                                    errors.password ? "border-red-500" : ""
                                }`}
                            />
                            {errors.password && (
                                <span className="text-red-500 text-sm">
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={`w-full ${
                                    errors.confirmPassword
                                        ? "border-red-500"
                                        : ""
                                }`}
                            />
                            {errors.confirmPassword && (
                                <span className="text-red-500 text-sm">
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>

                        <div className="form-group col-span-2">
                            <label>Profile Picture</label>
                            <input
                                type="file"
                                name="profile_picture"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="w-full"
                            />
                            {errors.profile_picture && (
                                <span className="text-red-500 text-sm">
                                    {errors.profile_picture}
                                </span>
                            )}
                            {(profilePreview || user.profile_picture) && (
                                <div className="mt-2">
                                    <img
                                        src={profilePreview || `/storage/${user.profile_picture}`}
                                        alt="Profile Preview"
                                        className="w-20 h-20 object-cover rounded-full"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/default-avatar.png';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Buttons - Bottom Row */}
                        <div className="col-span-2 flex justify-end space-x-2 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
