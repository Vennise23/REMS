import React, { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import ShowSuccessModal from "./ShowSuccessModal";
import ShowConfirmationModal from "./ShowConfirmationModal";
import "./../../../css/app.css";

const PropertyEditModal = ({ isOpen, onClose, property }) => {
    const [formData, setFormData] = useState({
        property_name: "",
        property_type: "",
        property_address_line_1: "",
        property_address_line_2: "",
        city: "",
        postal_code: "",
        state: "",
        purchase: "",
        sale_type: "",
        number_of_units: "",
        square_feet: "",
        price: "",
        certificate_photos: [],
        property_photos: [],
        each_unit_has_furnace: false,
        each_unit_has_electrical_meter: false,
        has_onsite_caretaker: false,
        parking: "",
        amenities: [],
        other_amenities: "",
        additional_info: "",
        agent_type: "",
    });

    const [isAgentType, setIsAgentType] = useState("");
    const [purchaseTerm, setPurchase_term] = useState("");
    const [certificatePhotoPreview, setCertificatePhotoPreview] = useState([]);
    const [propertyPhotoPreview, setPropertyPhotoPreview] = useState([]);
    const [certificateError, setCertificateError] = useState("");
    const [propertyError, setPropertyError] = useState("");
    const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(true);
    const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [suggestionsPostalCode, setSuggestionsPostalCode] = useState([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [propertyNameError, setPropertyNameError] = useState("");
    const [propertyType, setPropertyType] = useState("");

    useEffect(() => {
        if (property) {
            const basePath = "/storage/";
            setFormData({
                property_name: property.property_name || "",
                agent_type:
                    property.certificate_photos &&
                        property.certificate_photos.length > 0
                        ? "Agent"
                        : "Non Agent",
                property_address_line_1: property.property_address_line_1 || "",
                property_address_line_2: property.property_address_line_2 || "",
                city: property.city || "",
                postal_code: property.postal_code || "",
                purchase: property.purchase || "",
                sale_type: property.sale_type || "",
                property_type: property.property_type || "",
                number_of_units: property.number_of_units || "",
                square_feet: property.square_feet || "",
                price: property.price || "",
                certificate_photos: property.certificate_photos || [],
                property_photos: property.property_photos || [],
                each_unit_has_furnace: property.each_unit_has_furnace || "",
                each_unit_has_electrical_meter:
                    property.each_unit_has_electrical_meter || "",
                has_onsite_caretaker: property.has_onsite_caretaker || "",
                parking: property.parking || "",
                amenities: property.amenities || [],
                other_amenities: property.other_amenities || "",
                additional_info: property.additional_info || "",
            });
            setPurchase_term(property.purchase || "");
            setCertificatePhotoPreview(
                property.certificate_photos
                    ? property.certificate_photos.map(
                        (photo) => basePath + photo
                    )
                    : []
            );
            setPropertyPhotoPreview(
                property.property_photos
                    ? property.property_photos.map((photo) => basePath + photo)
                    : []
            );
        }
    }, [property]);

    useEffect(() => {
        setIsAgentType(formData.agent_type === "Agent" ? "Agent" : "");
    }, [formData.agent_type]);

    let debounceTimeout;

    const handleChange = async (e) => {
        const { name, value, type, files, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "property_name") {
            if (debounceTimeout) clearTimeout(debounceTimeout);

            debounceTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `/check-property-name/${value}`
                    );
                    const data = await response.json();
                    if (data.exists) {
                        setPropertyNameError(
                            `This property name already exists. Please choose a different one.`
                        );
                    } else {
                        setPropertyNameError("");
                    }
                } catch (error) {
                    console.error("Error checking property name:", error);
                }
            }, 500);
        }

        const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
        const MAX_CERTIFICATE_PHOTOS = 2;

        if (name === "agent_type") {
            setFormData({ ...formData, agent_type: value });
        } else if (name === "property_type") {
            setFormData({ ...formData, property_type: value });
        } else if (name === "purchase") {
            setFormData({ ...formData, purchase: value });
            setPurchase_term(value);
        } else if (type === "radio" && name === "sale_type") {
            setFormData({ ...formData, sale_type: value });
        } else if (name === "certificate_photos") {
            const currentPreviews = [...certificatePhotoPreview];
            const currentFiles = [...formData.certificate_photos];
            const newFiles = Array.from(files);

            if (
                currentFiles.length + newFiles.length >
                MAX_CERTIFICATE_PHOTOS
            ) {
                setCertificateError(
                    `Only upload up to ${MAX_CERTIFICATE_PHOTOS} certificate photos.`
                );
                e.target.value = null;
                return;
            }

            for (const file of newFiles) {
                if (!validImageTypes.includes(file.type)) {
                    setCertificateError(
                        "Only JPG and PNG files are allowed for certificate photo."
                    );
                    e.target.value = null;
                    return;
                }
                currentPreviews.push(URL.createObjectURL(file));
                currentFiles.push(file);
            }

            setCertificatePhotoPreview(currentPreviews);
            setFormData({ ...formData, certificate_photos: currentFiles });
            setCertificateError("");
        } else if (name === "property_photos") {
            const currentPreviews = [...propertyPhotoPreview];
            const currentFiles = [...formData.property_photos];
            const newFiles = Array.from(files);

            for (const file of newFiles) {
                if (!validImageTypes.includes(file.type)) {
                    setPropertyError(
                        "Only JPG and PNG files are allowed for property photos."
                    );
                    e.target.value = null;
                    return;
                }
                currentPreviews.push(URL.createObjectURL(file));
                currentFiles.push(file);
            }

            setPropertyPhotoPreview(currentPreviews);
            setFormData({ ...formData, property_photos: currentFiles });
            setPropertyError("");
        } else if (
            type === "checkbox" &&
            (name === "property_styles" || name === "amenities")
        ) {
            setFormData({
                ...formData,
                [name]: formData[name].includes(value)
                    ? formData[name].filter((item) => item !== value)
                    : [...formData[name], value],
            });
        } else if (
            type === "radio" &&
            (name === "each_unit_has_furnace" ||
                name === "each_unit_has_electrical_meter" ||
                name === "has_onsite_caretaker")
        ) {
            setFormData({ ...formData, [name]: value === "true" });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };


    const handleAddressChange = (e) => {
        const { value } = e.target;
        setFormData({ ...formData, property_address_line_1: value });
        if (value.length > 2) {
            fetchSuggestions(value, "address");
        } else {
            setSuggestions([]);
        }
    };

    const fetchSuggestions = async (query, type) => {
        setSuggestionsLoading(true);
        const response = await axios.get(`/api/proxy/nominatim?q=${encodeURIComponent(query)}`);
        setSuggestions(response.data);
        setSuggestionsLoading(false);
        // try {
        //     const url = `/api/place-autocomplete?query=${query}&type=${type}`;
        //     const response = await fetch(url);
        //     const data = await response.json();
        //     console.log("data suggestion: ", data);

        //     if (data.predictions && Array.isArray(data.predictions)) {
        //         if (type === "address") {
        //             const suggestions = data.predictions.map((prediction) => ({
        //                 description: prediction.description,
        //                 placeId: prediction.place_id,
        //                 geometry: prediction.geometry,
        //             }));
        //             setSuggestions(suggestions);
        //         } else {
        //             setSuggestionsPostalCode(
        //                 data.predictions.map(
        //                     (prediction) => prediction.description
        //                 )
        //             );
        //         }
        //     } else {
        //         if (type === "address") {
        //             setSuggestions([]);
        //         } else {
        //             setSuggestionsPostalCode([]);
        //         }
        //     }
        // } catch (error) {
        //     console.error("Error fetching address suggestions:", error);
        // }
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
                const state = addressComponents.find((component) =>
                    component.types.includes("administrative_area_level_1")
                );
                const postalCodeComponent = addressComponents.find(
                    (component) => component.types.includes("postal_code")
                );

                const { lat, lng } = data.results[0].geometry.location;
                const property_address_line_1 = streetNumber
                    ? `${streetNumber.long_name}, ${streetAddress_1 ? streetAddress_1.long_name : ""
                    }`
                    : streetAddress_1
                        ? streetAddress_1.long_name
                        : "";

                return {
                    property_address_line_1,
                    property_address_line_2: streetAddress_2
                        ? streetAddress_2.long_name
                        : "",
                    city: city ? city.long_name : "",
                    country: country ? country.long_name : "",
                    state: state ? state.long_name : "",
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
            console.log("checking geonames", data);

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
                country:country,
                state:state,
                postal_code: postcode
            }));
            setSuggestions([]);
            // const googleResult = await fetchPostalCode(suggestion.placeId);

            // if (googleResult) {
            //     const {
            //         lat,
            //         lng,
            //         postalCode,
            //         property_address_line_1,
            //         property_address_line_2,
            //         city,
            //         country,
            //         state,
            //     } = googleResult;

            //     let postalInfo = postalCode
            //         ? { postalCode }
            //         : await fetchPostalCodeFromGeonames(lat, lng);

            //     console.log("postalCode", postalInfo);

            //     setFormData({
            //         ...formData,
            //         property_address_line_1,
            //         property_address_line_2,
            //         city,
            //         country,
            //         postal_code: postalInfo?.postalCode || postalCode || "",
            //         state: postalInfo?.adminName1 || state || "",
            //     });

            //     console.log("Updated formData:", formData);
            // }
        } catch (error) {
            console.error("Error selecting address:", error);
        }

        setSuggestions([]);
    };

    const onSubmitHandler = (e) => {
        e.preventDefault();
        setShowConfirmationModal(true);
    };

    const handleCloseConfirmationModal = () => {
        setShowConfirmationModal(false);
    };

    const handleConfirmSubmit = async (e) => {
        setLoading(true);
        const data = new FormData();
        console.log("Form submitted:", formData);

        Object.keys(formData).forEach((key) => {
            if (key === "certificate_photos" || key === "property_photos") {
                if (formData[key]) {
                    Array.from(formData[key]).forEach((file) => {
                        data.append(`${key}[]`, file);
                    });
                }
            } else if (Array.isArray(formData[key])) {
                formData[key].forEach((item) => data.append(`${key}[]`, item));
            } else if (
                key === "each_unit_has_furnace" ||
                key === "each_unit_has_electrical_meter" ||
                key === "has_onsite_caretaker"
            ) {
                const booleanValue = formData[key] ? 1 : 0;
                data.append(key, booleanValue);
            } else {
                data.append(key, formData[key]);
            }
        });

        if (formData.state) {
            data.append("state", formData.state);
        }

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        console.log("CSRF Token:", csrfToken);

        try {
            const response = await axios.post(
                `/properties/${property.id}`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-CSRF-Token": csrfToken,
                    },
                }
            );
            setShowConfirmationModal(false);
            setShowSuccessModal(true);
        } catch (error) {
            if (error.response && error.response.data.errors) {
                const validationErrors = error.response.data.errors;
                console.error("Validation Errors:", validationErrors);
            } else {
                console.log("Submission Error:", error);
                alert("Error submitting the form");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    const handleDeletePhoto = (photoType, index) => {
        let updatedPreview = [];
        if (photoType === "certificate") {
            updatedPreview = [...certificatePhotoPreview];
            updatedPreview.splice(index, 1);
            setCertificatePhotoPreview(updatedPreview);

            const updatedFiles = [...formData.certificate_photos];
            updatedFiles.splice(index, 1);
            setFormData({
                ...formData,
                certificate_photos: updatedFiles,
            });
        } else if (photoType === "property") {
            updatedPreview = [...propertyPhotoPreview];
            updatedPreview.splice(index, 1);
            setPropertyPhotoPreview(updatedPreview);
            const updatedFiles = [...formData.property_photos];
            updatedFiles.splice(index, 1);
            setFormData({
                ...formData,
                property_photos: updatedFiles,
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            {loading && (
                <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75 z-50">
                    <div className="w-16 h-16 border-t-4 border-red-500 border-solid rounded-full animate-spin"></div>
                </div>
            )}
            <div className="bg-white rounded-lg shadow-lg w-10/12 max-w-2xl max-h-[90vh] relative overflow-hidden">
                <div className="p-6 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Edit for Property
                    </h2>

                    <form onSubmit={onSubmitHandler}>
                        <input
                            type="hidden"
                            name="_token"
                            value="{{ csrf_token() }}"
                        />
                        <div>
                            <h3
                                className="text-xl font-semibold mb-2 cursor-pointer flex justify-between items-center"
                                onClick={() =>
                                    setIsPropertyDetailsOpen(
                                        !isPropertyDetailsOpen
                                    )
                                }
                            >
                                Property Details
                                <span>{isPropertyDetailsOpen ? "▽" : "▷"}</span>
                            </h3>
                            {isPropertyDetailsOpen && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <input
                                                type="text"
                                                name="property_name"
                                                placeholder="Property Name*"
                                                value={formData.property_name}
                                                onChange={handleChange}
                                                required
                                                className="p-2 border rounded-md w-full"
                                            />
                                        </div>

                                        <select
                                            name="agent_type"
                                            value={formData.agent_type}
                                            onChange={handleChange}
                                            className="p-2 border rounded-md w-full"
                                            required
                                        >
                                            <option value="" disabled>
                                                Select Agent Type
                                            </option>
                                            <option value="Non Agent">
                                                Non Agent
                                            </option>
                                            <option value="Agent">Agent</option>
                                        </select>
                                        {propertyNameError && (
                                            <p className="text-red-500 whitespace-nowrap">
                                                {propertyNameError}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 col-span-2 relative">
                                            <div className="relative">
                                                {/* Property Address Line 1 Input */}
                                                <input
                                                    type="text"
                                                    name="property_address_line_1"
                                                    placeholder="Property Address Line 1*"
                                                    value={
                                                        formData.property_address_line_1
                                                    }
                                                    onChange={
                                                        handleAddressChange
                                                    }
                                                    required
                                                    className="p-2 border rounded-md w-full"
                                                />
                                                {/* Display address suggestions */}
                                                {suggestions.length > 0 && (
                                                    <ul className="suggestions-list absolute bg-white border border-gray-300 w-full max-h-40 overflow-auto z-10">
                                                        {suggestions.map(
                                                            (
                                                                suggestion,
                                                                index
                                                            ) => (
                                                                <li
                                                                    key={index}
                                                                    onClick={() =>
                                                                        onAddressSelect(suggestion.display_name)
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
                                            <input
                                                type="text"
                                                name="property_address_line_2"
                                                placeholder="Property Address Line 2"
                                                value={
                                                    formData.property_address_line_2
                                                }
                                                onChange={handleChange}
                                                className="p-2 border rounded-md w-full"
                                            />
                                        </div>

                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="City*"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            className="p-2 border rounded-md w-full"
                                        />

                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="postal_code"
                                                placeholder="Postal Code*"
                                                value={formData.postal_code}
                                                onChange={handleChange}
                                                required
                                                className="p-2 border rounded-md w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Purchase */}
                                    <h3 className="text-xl font-semibold mt-6 mb-2">
                                        Purchase Term:
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition">
                                            <input
                                                type="radio"
                                                name="purchase"
                                                value="For Sale"
                                                onChange={handleChange}
                                                checked={
                                                    formData.purchase ===
                                                    "For Sale"
                                                }
                                                className="text-red-500"
                                            />
                                            <span>For Sale</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition">
                                            <input
                                                type="radio"
                                                name="purchase"
                                                value="For Rent"
                                                onChange={handleChange}
                                                checked={
                                                    formData.purchase ===
                                                    "For Rent"
                                                }
                                                className="text-red-500"
                                            />
                                            <span>For Rent</span>
                                        </label>
                                    </div>

                                    {/* Sale Types */}
                                    {purchaseTerm === "For Sale" && (
                                        <div>
                                            <h3 className="text-xl font-semibold mt-6 mb-2">
                                                Sale Types:
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition">
                                                    <input
                                                        type="radio"
                                                        name="sale_type"
                                                        value="New Launch"
                                                        onChange={handleChange}
                                                        checked={
                                                            formData.sale_type ===
                                                            "New Launch"
                                                        }
                                                        className="text-red-500"
                                                    />
                                                    <span>New Launch</span>
                                                </label>
                                                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition">
                                                    <input
                                                        type="radio"
                                                        name="sale_type"
                                                        value="Subsale"
                                                        onChange={handleChange}
                                                        checked={
                                                            formData.sale_type ===
                                                            "Subsale"
                                                        }
                                                        className="text-red-500"
                                                    />
                                                    <span>Subsale</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <h3 className="text-xl font-semibold mt-6 mb-2">
                                        Property Type:
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 col-span-2">
                                        <select
                                            name="property_type"
                                            value={formData.property_type}
                                            onChange={handleChange}
                                            className="p-2 border rounded-md"
                                            required
                                        >
                                            <option value="" disabled>
                                                Select Property Type
                                            </option>
                                            <option value="Conventional Condominium">
                                                Conventional Condominium
                                            </option>
                                            <option value="Bare Land Condominium">
                                                Bare Land Condominium
                                            </option>
                                            <option value="Commercial">
                                                Commercial
                                            </option>
                                        </select>

                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="number"
                                                name="number_of_units"
                                                placeholder="Number of Units*"
                                                value={formData.number_of_units}
                                                onChange={(e) => {
                                                    if (e.target.value < 1) {
                                                        e.target.value = 1;
                                                    }
                                                    handleChange(e);
                                                }}
                                                required
                                                min="1"
                                                step="1"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className="p-2 border rounded-md w-full"
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "." ||
                                                        e.key === "," ||
                                                        e.key === "e"
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />

                                            <input
                                                type="number"
                                                name="square_feet"
                                                placeholder="Square Feet*"
                                                value={formData.square_feet}
                                                onChange={(e) => {
                                                    if (e.target.value < 1) {
                                                        e.target.value = 1;
                                                    }
                                                    handleChange(e);
                                                }}
                                                min="1"
                                                step="1"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className="p-2 border rounded-md w-full"
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "." ||
                                                        e.key === "," ||
                                                        e.key === "e"
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <input
                                                type="number"
                                                name="price"
                                                placeholder="Price (RM)*"
                                                value={formData.price}
                                                onChange={(e) => {
                                                    if (e.target.value < 1) {
                                                        e.target.value = 1;
                                                    }
                                                    handleChange(e);
                                                }}
                                                required
                                                min="1"
                                                step="0.01"
                                                className="p-2 border rounded-md w-full"
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "." &&
                                                        e.target.value.includes(
                                                            "."
                                                        )
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onInput={(e) => {
                                                    const value =
                                                        e.target.value;

                                                    if (
                                                        value.startsWith("0") &&
                                                        value.length > 1 &&
                                                        value[1] !== "."
                                                    ) {
                                                        e.target.value =
                                                            value.slice(1);
                                                    }

                                                    if (
                                                        value.includes(".") &&
                                                        value.split(".")[1]
                                                            .length > 2
                                                    ) {
                                                        e.target.value =
                                                            value.substring(
                                                                0,
                                                                value.indexOf(
                                                                    "."
                                                                ) + 3
                                                            );
                                                    }

                                                    // if (value.includes('.') && value.split('.')[1].length === 1) {
                                                    //     e.target.value = value + '0';
                                                    // }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {isAgentType === "Agent" && (
                                        <div className="mt-4">
                                            <label className="block font-semibold">
                                                Upload Certificate Photos:
                                            </label>
                                            <input
                                                type="file"
                                                name="certificate_photos"
                                                onChange={handleChange}
                                                accept="image/*"
                                                multiple
                                                className="p-2 border rounded-md w-full"
                                            />
                                            {certificateError && (
                                                <p className="text-red-500 mt-2">
                                                    {certificateError}
                                                </p>
                                            )}
                                            {/* Show certificate photo previews */}
                                            {certificatePhotoPreview.length >
                                                0 && (
                                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                                        {certificatePhotoPreview.map(
                                                            (src, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="relative"
                                                                >
                                                                    <img
                                                                        src={src}
                                                                        alt={`Certificate Preview ${index}`}
                                                                        className="w-full h-auto object-cover rounded-md"
                                                                    />
                                                                    {/* 删除按钮 */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeletePhoto(
                                                                                "certificate",
                                                                                index
                                                                            )
                                                                        }
                                                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                                                                    >
                                                                        X
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <label className="block font-semibold">
                                            Upload Property Photos:
                                        </label>
                                        <input
                                            type="file"
                                            name="property_photos"
                                            onChange={handleChange}
                                            accept="image/*"
                                            multiple
                                            className="p-2 border rounded-md w-full"
                                        />
                                        {propertyError && (
                                            <p className="text-red-500 mt-2">
                                                {propertyError}
                                            </p>
                                        )}
                                        {/* Show property photo previews */}
                                        {propertyPhotoPreview.length > 0 && (
                                            <div className="mt-4 grid grid-cols-3 gap-2">
                                                {propertyPhotoPreview.map(
                                                    (src, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative"
                                                        >
                                                            <img
                                                                src={src}
                                                                alt={`Property Preview ${index}`}
                                                                className="w-full h-auto object-cover rounded-md"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeletePhoto(
                                                                        "property",
                                                                        index
                                                                    )
                                                                }
                                                                className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full px-1 py-0.5"
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <hr className="my-10 border-t border-gray-300" />

                        <div>
                            <h3
                                className="text-xl font-semibold mt-6 mb-2 cursor-pointer flex justify-between items-center"
                                onClick={() =>
                                    setIsAdditionalInfoOpen(
                                        !isAdditionalInfoOpen
                                    )
                                }
                            >
                                Additional Information
                                <span>{isAdditionalInfoOpen ? "▽" : "▷"}</span>
                            </h3>
                            {isAdditionalInfoOpen && (
                                <>
                                    <h3 className="font-semibold mt-4 mb-2">
                                        Does each unit have its own furnace?
                                    </h3>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="each_unit_has_furnace"
                                                value={true}
                                                onChange={handleChange}
                                                checked={
                                                    formData.each_unit_has_furnace ===
                                                    true
                                                }
                                                className="text-red-500"
                                            />
                                            <span>Yes</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="each_unit_has_furnace"
                                                value={false}
                                                onChange={handleChange}
                                                checked={
                                                    formData.each_unit_has_furnace ===
                                                    false
                                                }
                                                className="text-red-500"
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>

                                    <h3 className="font-semibold mt-4 mb-2">
                                        Does each unit have its own electrical
                                        meter?
                                    </h3>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="each_unit_has_electrical_meter"
                                                value={true}
                                                onChange={handleChange}
                                                checked={
                                                    formData.each_unit_has_electrical_meter ===
                                                    true
                                                }
                                                className="text-red-500"
                                            />
                                            <span>Yes</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="each_unit_has_electrical_meter"
                                                value={false}
                                                onChange={handleChange}
                                                checked={
                                                    formData.each_unit_has_electrical_meter ===
                                                    false
                                                }
                                                className="text-red-500"
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>

                                    <h3 className="font-semibold mt-4 mb-2">
                                        Is there an on-site caretaker or any
                                        direct employees?
                                    </h3>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="has_onsite_caretaker"
                                                value={true}
                                                onChange={handleChange}
                                                checked={
                                                    formData.has_onsite_caretaker ===
                                                    true
                                                }
                                                className="text-red-500"
                                            />
                                            <span>Yes</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="has_onsite_caretaker"
                                                value={false}
                                                onChange={handleChange}
                                                checked={
                                                    formData.has_onsite_caretaker ===
                                                    false
                                                }
                                                className="text-red-500"
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>

                                    <h3 className="font-semibold mt-4 mb-2">
                                        Parking:
                                    </h3>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="parking"
                                                value="Above ground"
                                                onChange={handleChange}
                                                checked={
                                                    formData.parking ===
                                                    "Above ground"
                                                }
                                                className="text-red-500"
                                            />
                                            <span>Above ground</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="parking"
                                                value="Underground"
                                                onChange={handleChange}
                                                checked={
                                                    formData.parking ===
                                                    "Underground"
                                                }
                                                className="text-red-500"
                                            />
                                            <span>Underground</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="parking"
                                                value="Both"
                                                onChange={handleChange}
                                                checked={
                                                    formData.parking === "Both"
                                                }
                                                className="text-red-500"
                                            />
                                            <span>Both</span>
                                        </label>
                                    </div>

                                    <h3 className="font-semibold mt-4 mb-2">
                                        Please check all amenities:
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            "Pool",
                                            "Gym",
                                            "Sauna / Spa",
                                            "Meeting Room",
                                            "Games Room",
                                            "Tennis Court(s)",
                                            "Guest Suite",
                                            "Car Wash",
                                            "Common Building / Garage",
                                        ].map((amenity) => (
                                            <label
                                                key={amenity}
                                                className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition"
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="amenities"
                                                    value={amenity}
                                                    onChange={handleChange}
                                                    checked={formData.amenities.includes(
                                                        amenity
                                                    )}
                                                    className="text-red-500"
                                                />
                                                <span>{amenity}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <input
                                        type="text"
                                        name="other_amenities"
                                        placeholder="Other - Please list"
                                        onChange={handleChange}
                                        value={formData.other_amenities}
                                        className="p-2 border rounded-md w-full mt-4"
                                    />
                                    <textarea
                                        name="additional_info"
                                        placeholder="Please provide any additional information or comments"
                                        onChange={handleChange}
                                        value={formData.additional_info}
                                        className="p-2 border rounded-md w-full mt-4"
                                    ></textarea>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-4"
                            >
                                Close
                            </button>
                            <button
                                type="save"
                                className="bg-red-500 text-white px-6 py-2 rounded-md"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ShowConfirmationModal
                isOpen={showConfirmationModal}
                message="Are you sure you want to save the form?"
                onClose={handleCloseConfirmationModal}
                onConfirm={handleConfirmSubmit}
            />
            <ShowSuccessModal
                isOpen={showSuccessModal}
                message="Your property application has been saved successfully."
                onClose={handleCloseSuccessModal}
            />
        </div>
    );
};

export default PropertyEditModal;