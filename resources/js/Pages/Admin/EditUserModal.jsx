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

    const validatePhone = (phone, skipValidation = false) => {
        // Skip validation if phone hasn't changed
        if (skipValidation || phone === user.phone) {
            return true;
        }

        const phoneRegex = /^(?:\+60|0)(1[0-9]{8,9})$/;
        if (!phoneRegex.test(phone)) {
            setErrors((prev) => ({
                ...prev,
                phone: "Invalid Malaysian phone number format",
            }));
            return false;
        }
        return true;
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

                if (newFirstname.toLowerCase() === newLastname.toLowerCase()) {
                    setErrors(prev => ({
                        ...prev,
                        firstname: 'First name and last name cannot be the same',
                        lastname: 'First name and last name cannot be the same'
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        firstname: '',
                        lastname: ''
                    }));
                }
                setFormData(prev => ({ ...prev, [name]: value }));
                break;

            case 'email':
                setFormData(prev => ({ ...prev, [name]: value }));
                
                // Email format validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[com]+$/;
                if (!emailRegex.test(value)) {
                    setErrors(prev => ({
                        ...prev,
                        email: 'Invalid email format. Must contain @ and end with .com'
                    }));
                    return;
                }

                // Skip uniqueness check if value is same as original
                if (value === user.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                    return;
                }

                // Check email uniqueness
                try {
                    const response = await fetch('/api/check-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                        },
                        body: JSON.stringify({ 
                            email: value,
                            user_id: user.id 
                        })
                    });
                    const data = await response.json();
                    if (!data.available) {
                        setErrors(prev => ({ ...prev, email: 'This email is already in use' }));
                    } else {
                        setErrors(prev => ({ ...prev, email: '' }));
                    }
                } catch (error) {
                    console.error('Email check error:', error);
                }
                break;

            case 'phone':
                const numericValue = value.replace(/[^0-9]/g, '');
                setFormData(prev => ({ ...prev, [name]: numericValue }));
                
                const phoneRegex = /^(?:0|60|\+60)?1(?:[0-46-9])(?:\d{7}|\d{8})$/;
                if (!phoneRegex.test(numericValue)) {
                    setErrors(prev => ({ 
                        ...prev, 
                        phone: 'Invalid Malaysian phone format (e.g., 0123456789)'
                    }));
                } else {
                    setErrors(prev => ({ ...prev, phone: '' }));
                }
                break;

            case 'ic_number':
                const icValue = value.replace(/[^0-9]/g, '');
                if (icValue.length <= 12) {
                    setFormData(prev => ({ ...prev, [name]: icValue }));
                    
                    if (icValue.length === 12) {
                        // Skip uniqueness check if value is same as original
                        if (icValue === user.ic_number) {
                            setErrors(prev => ({ ...prev, ic_number: '' }));
                            
                            const birthDate = icValue.substring(0, 6);
                            const gender = parseInt(icValue.charAt(11)) % 2 === 0 ? 'Female' : 'Male';
                            
                            // Calculate age
                            const year = parseInt(birthDate.substring(0, 2));
                            const month = parseInt(birthDate.substring(2, 4)) - 1;
                            const day = parseInt(birthDate.substring(4, 6));
                            const fullYear = year + (year > 50 ? 1900 : 2000);
                            const birthDateTime = new Date(fullYear, month, day);
                            const today = new Date();
                            let age = today.getFullYear() - birthDateTime.getFullYear();
                            
                            setFormData(prev => ({
                                ...prev,
                                born_date: birthDateTime.toISOString().split('T')[0],
                                gender: gender,
                                age: age.toString()
                            }));
                            return;
                        }

                        // Check IC uniqueness
                        try {
                            const response = await fetch('/api/check-ic', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                                },
                                body: JSON.stringify({ 
                                    ic_number: icValue,
                                    user_id: user.id 
                                })
                            });
                            const data = await response.json();
                            if (!data.available) {
                                setErrors(prev => ({ ...prev, ic_number: 'This IC number is already registered' }));
                            } else {
                                setErrors(prev => ({ ...prev, ic_number: '' }));
                                
                                // Process IC number data only if unique
                                const birthDate = icValue.substring(0, 6);
                                const gender = parseInt(icValue.charAt(11)) % 2 === 0 ? 'Female' : 'Male';
                                
                                // Calculate age
                                const year = parseInt(birthDate.substring(0, 2));
                                const month = parseInt(birthDate.substring(2, 4)) - 1;
                                const day = parseInt(birthDate.substring(4, 6));
                                const fullYear = year + (year > 50 ? 1900 : 2000);
                                const birthDateTime = new Date(fullYear, month, day);
                                const today = new Date();
                                let age = today.getFullYear() - birthDateTime.getFullYear();
                                
                                setFormData(prev => ({
                                    ...prev,
                                    born_date: birthDateTime.toISOString().split('T')[0],
                                    gender: gender,
                                    age: age.toString()
                                }));
                            }
                        } catch (error) {
                            console.error('IC check error:', error);
                        }
                    } else if (icValue.length > 0) {
                        setErrors(prev => ({ ...prev, ic_number: 'IC number must be 12 digits' }));
                    }
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

        // Only validate fields that have changed
        let hasErrors = false;

        if (formData.email !== user.email) {
            if (!validateEmail(formData.email)) hasErrors = true;
        }

        if (formData.phone !== user.phone) {
            if (!validatePhone(formData.phone)) hasErrors = true;
        }

        if (
            formData.firstname !== user.firstname ||
            formData.lastname !== user.lastname
        ) {
            if (
                formData.firstname.toLowerCase() ===
                formData.lastname.toLowerCase()
            ) {
                setErrors((prev) => ({
                    ...prev,
                    firstname: "First name and last name cannot be the same",
                    lastname: "First name and last name cannot be the same",
                }));
                hasErrors = true;
            }
            if (!(await validateName(formData.firstname, formData.lastname))) {
                hasErrors = true;
            }
        }

        if (hasErrors) return;

        setIsSubmitting(true);
        const formDataToSend = new FormData();

        // Only append changed values and ensure proper formatting
        Object.keys(formData).forEach((key) => {
            // Skip empty password field
            if (key === "password" && !formData[key]) return;

            // Skip null/undefined values
            if (formData[key] === null || formData[key] === undefined) return;

            // Handle file separately
            if (key === "profile_picture" && formData[key] instanceof File) {
                formDataToSend.append("profile_picture", formData[key]);
            } else {
                // Convert non-string values to string
                formDataToSend.append(key, String(formData[key]));
            }
        });

        try {
            const response = await axios.post(
                `/api/users/${user.id}`,
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-HTTP-Method-Override": "PUT",
                        Accept: "application/json",
                    },
                }
            );

            if (response.data.success) {
                onUpdate();
                onClose();
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                // Handle validation errors from Laravel
                setErrors(error.response.data.errors);
            } else {
                setErrors({
                    submit:
                        error.response?.data?.message ||
                        "An error occurred while updating the user",
                });
            }
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
                                value={formData.gender}
                                onChange={handleInputChange}
                                disabled={formData.idType === "ic"}
                                className="w-full"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
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
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
