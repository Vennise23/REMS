import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import axios from "../../axiosConfig";
import ShowSuccessModal from "./ShowSuccessModal";
import ShowConfirmationModal from "./ShowConfirmationModal";
import "./../../../css/app.css";
import TextInput from "../TextInput";
import InputLabel from "@/Components/InputLabel";
import RadioInput from "@/Components/RadioInput";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import SecondaryButton from "../SecondaryButton";

const PropertyFormModal = ({ isOpen, onClose, property = null }) => {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
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
    const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(true);
    const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("Add Property");
    const [route, setRoute] = useState(`apply-property`);
    const [confirmCallback, setConfirmCallback] = useState(null);
    const [deletedPhotos, setDeletedPhotos] = useState({
        certificate_photos: [],
        property_photos: []
    });
    

    useEffect(() => {
        clearForm();
        // if property is not empty == Edit mode
        if (property != null) {
            setTitle("Edit Property");
            setRoute(`update-property/${property.id}`);
            const basePath = "/storage/";
            setData({
                property_name: property.property_name,
                agent_type:
                    property.certificate_photos &&
                        property.certificate_photos.length > 0
                        ? "Agent"
                        : "Non Agent",
                property_address_line_1: property.property_address_line_1,
                property_address_line_2: property.property_address_line_2,
                city: property.city,
                postal_code: property.postal_code,
                state: property.state,
                purchase: property.purchase,
                sale_type: property.sale_type,
                property_type: property.property_type,
                number_of_units: property.number_of_units,
                square_feet: property.square_feet,
                price: property.price,
                certificate_photos: property.certificate_photos || [],
                property_photos: property.property_photos || [],
                each_unit_has_furnace: property.each_unit_has_furnace,
                each_unit_has_electrical_meter: property.each_unit_has_electrical_meter,
                has_onsite_caretaker: property.has_onsite_caretaker,
                parking: property.parking,
                amenities: property.amenities || [],
                other_amenities: property.other_amenities,
                additional_info: property.additional_info,
            });
            setPurchase_term(property.purchase);
            setCertificatePhotoPreview(
                property.certificate_photos
                    ? property.certificate_photos.map(
                        (photo) => basePath + photo
                    ) : []
            );
            setPropertyPhotoPreview(
                property.property_photos? property.property_photos.map((photo) => basePath + photo) : []
            );
        } else {
            setTitle("Add Property");
            setRoute(`apply-property`);
        }
    }, [property]);

    useEffect(() => {
        setIsAgentType(data.agent_type === "Agent" ? "Agent" : "");
    }, [data.agent_type]);

    let debounceTimeout;

    const handleChange = async (e) => {
        const { name, value, type, files, checked } = e.target;
        const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
        const MAX_CERTIFICATE_PHOTOS = 2;

        // Validation
        switch (name) {
            case "property_name":
                setData(name, value);
                if (debounceTimeout) clearTimeout(debounceTimeout);

                debounceTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(
                            `/check-property-name/${value}`
                        );
                        const propertyNameCheck = await response.json();
                        if (propertyNameCheck.exists) {
                            setError("property_name", "This property name already exists. Please choose a different one.");
                        } else {
                            clearErrors("property_name");
                        }
                    } catch (error) {
                        console.error("Error checking property name:", error);
                    }
                }, 500);
                break;
            case "purchase":
                setPurchase_term(value);
                setData(name, value);
                break;
            case "certificate_photos":
                const newCertificateFiles = Array.from(files);
                const currCertificatePreview = [...certificatePhotoPreview];
                const currCertificateFiles = [...data, certificate_photos];
                if (newCertificateFiles.length > MAX_CERTIFICATE_PHOTOS) {
                    setError("certificate_photos", `Only upload up to ${MAX_CERTIFICATE_PHOTOS} certificate photos.`);
                    return;
                }

                for (const file of newCertificateFiles) {
                    if (!validImageTypes.includes(file.type)) {
                        setError("certificate_photos", "Only JPG and PNG files are allowed.");
                        return;
                    }
                    currCertificatePreview.push(URL.createObjectURL(file));
                    currCertificateFiles.push(file);
                }

                setCertificatePhotoPreview(currCertificatePreview); // Preview
                setData({ ...data, certificate_photos: currCertificateFiles }); // Store actual files
                clearErrors("certificate_photos");
                break;
            case "property_photos":
                const newPropertyFiles = Array.from(files);
                const currPropertyPreview = [...propertyPhotoPreview];
                const currPropertyFiles = [...data.property_photos];
                for (const file of newPropertyFiles) {
                    if (!validImageTypes.includes(file.type)) {
                        setError("property_photos", "Only JPG and PNG files are allowed.");
                        return;
                    }
                    currPropertyPreview.push(URL.createObjectURL(file));
                    currPropertyFiles.push(file);
                }

                setPropertyPhotoPreview(currPropertyPreview); // Preview
                setData({ ...data, property_photos: currPropertyFiles }); // Store actual files
                clearErrors("property_photos");
                break;
            case "property_styles":
            case "amenities":
                setData({
                    ...data, [name]: data[name].includes(value) ?
                        data[name].filter((item) => item !== value)
                        : [...data[name], value],
                });
                break;
            case "each_unit_has_furnace":
            case "each_unit_has_electrical_meter":
            case "has_onsite_caretaker":
                setData(name, value === "true");
                break;
            default:
                setData(name, value);
                break;
        }
    };

    const handleAddressChange = (e) => {
        const { value } = e.target;
        setData({ ...data, property_address_line_1: value });
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
    };

    const onAddressSelect = async (suggestion) => {
        // Split the address by comma and remove any extra spaces
        let parts = suggestion.split(',').map(part => part.trim());

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
            property_address_line_1: address1,
            property_address_line_2: address2,
            city: city,
            state: state,
            postal_code: postcode
        }));
        setSuggestions([]);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        const isConfirmed = await ConfirmModel(); // Wait for confirmation
        if (!isConfirmed) return;

        const formData = new FormData();
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
        formData.append("_token", csrfToken);

        Object.keys(data).forEach((key) => {
            if (key === "property_photos" || key === "certificate_photos") {
                if (Array.isArray(data[key])) {
                    data[key].forEach((file, index) => {
                        if (file instanceof File) {
                            // new file
                            formData.append(`${key}[${index}]`, file);
                        } else {
                            // Picture that passed by link (previous data)
                            // formData.append(`${key}[${index}]`,value);
                        }
                    });
                }
            } else if (Array.isArray(data[key])) {
                data[key].forEach((item) => formData.append(`${key}[]`, item));
            } else if (
                key === "each_unit_has_furnace" ||
                key === "each_unit_has_electrical_meter" ||
                key === "has_onsite_caretaker"
            ) {
                const booleanValue = data[key] ? 1 : 0;
                formData.append(key, booleanValue);
            } else {
                formData.append(key, data[key]);
            }
        });

        Object.keys(deletedPhotos).forEach((key) => {
            deletedPhotos[key].forEach((file, index) => {
                formData.append(`deleted_photos[${key}][${index}]`, file);
            });
        });
        
        try {
            const response = await fetch(route, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log("Form submitted successfully:", response);
            setLoading(false);
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
            setLoading(false);
        }
    };


    const ConfirmModel = () => {
        return new Promise((resolve) => {
            setShowConfirmationModal(true);
            setConfirmCallback(() => resolve); // Store resolve function
        });
    };

    const handleConfirm = () => {
        setShowConfirmationModal(false);
        confirmCallback(true); // Resolve promise with "true"
    };

    const handleCancel = () => {
        setShowConfirmationModal(false);
        confirmCallback(false); // Resolve promise with "false"
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        onClose();
    };

    const handleClose = () => {
        clearForm();
        setSuggestions([]);
        setShowConfirmationModal(false);
        setShowSuccessModal(false);
        onClose();
    };

    const clearForm = () => {
        setData({
            property_name: "",
            property_type: "",
            property_address_line_1: "",
            property_address_line_2: "",
            city: "",
            postal_code: "",
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
        setCertificatePhotoPreview([]);
        setPropertyPhotoPreview([]);

    }

    const handleDeletePhoto = (photoType, index) => {
        let updatedPreview = [];
        let updatedFiles = [];
    
        if (photoType === "certificate") {
            updatedPreview = [...certificatePhotoPreview];
            updatedFiles = [...data.certificate_photos];
    
            // Track deleted photos if it's a link (existing in DB)
            if (typeof updatedFiles[index] === "string") {
                setDeletedPhotos((prev) => ({
                    ...prev,
                    certificate_photos: [...prev.certificate_photos, updatedFiles[index]]
                }));
            }
    
            updatedPreview.splice(index, 1);
            updatedFiles.splice(index, 1);
    
            setCertificatePhotoPreview(updatedPreview);
            setData({ ...data, certificate_photos: updatedFiles });
    
        } else if (photoType === "property") {
            updatedPreview = [...propertyPhotoPreview];
            updatedFiles = [...data.property_photos];
    
            // Track deleted photos if it's a link (existing in DB)
            if (typeof updatedFiles[index] === "string") {
                setDeletedPhotos((prev) => ({
                    ...prev,
                    property_photos: [...prev.property_photos, updatedFiles[index]]
                }));
            }
    
            updatedPreview.splice(index, 1);
            updatedFiles.splice(index, 1);
    
            setPropertyPhotoPreview(updatedPreview);
            setData({ ...data, property_photos: updatedFiles });
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
                        {title}
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
                                    <div className="grid  grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div >
                                            <InputLabel htmlFor="property_name" value="Property Name" />
                                            <TextInput
                                                id="property_name"
                                                name="property_name"
                                                value={data.property_name}
                                                placeholder="Property Name*"
                                                onChange={handleChange}
                                                required
                                                className="border rounded-md w-full"
                                            />
                                            <InputError
                                                message={errors?.property_name || ""}
                                                className="text-red-500"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="agent_type" value="Agent Type" />
                                            <select
                                                id="agent_type"
                                                name="agent_type"
                                                value={data.agent_type}
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
                                            <InputError
                                                message={errors?.agent_type}
                                                className="text-red-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 relative mt-4">
                                        <div className="relative">
                                            <InputLabel htmlFor="property_address_line_1" value="Address" />
                                            <TextInput
                                                id="property_address_line_1"
                                                name="property_address_line_1"
                                                type="text"
                                                placeholder="Property Address Line 1*"
                                                value={data.property_address_line_1}
                                                onChange={handleAddressChange}
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
                                                                    {suggestion.display_name ||
                                                                        "Unknown Address"}
                                                                </div>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                            <InputError
                                                message={errors?.property_address_line_1}
                                                className="text-red-500"
                                            />
                                        </div>
                                        <TextInput
                                            id="property_address_line_2"
                                            name="property_address_line_2"
                                            type="text"
                                            placeholder="Property Address Line 2"
                                            value={data.property_address_line_2}
                                            onChange={handleChange}
                                            className="border rounded-md w-full"
                                        />
                                        <InputError
                                            message={errors?.property_address_line_2}
                                            className="text-red-500"
                                        />
                                    </div>

                                    <div className="grid  grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <InputLabel htmlFor="city" value="City" />
                                            <TextInput
                                                id="city"
                                                name="city"
                                                placeholder="City*"
                                                value={data.city}
                                                onChange={handleChange}
                                                required
                                                className="border rounded-md w-full"
                                            />
                                            <InputError
                                                message={errors?.city}
                                                className="text-red-500"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="state" value="State" />
                                            <TextInput
                                                id="state"
                                                name="state"
                                                placeholder="State*"
                                                value={data.state}
                                                onChange={handleChange}
                                                required
                                                className="border rounded-md w-full"
                                            />
                                            <InputError
                                                message={errors?.state}
                                                className="text-red-500"
                                            />
                                        </div>

                                        <div className="relative">
                                            <InputLabel htmlFor="postal_code" value="Postal Code" />
                                            <TextInput
                                                id="postal_code"
                                                name="postal_code"
                                                placeholder="Postal Code*"
                                                value={data.postal_code}
                                                onChange={handleChange}
                                                required
                                                className="p-2 border rounded-md w-full"
                                            />
                                            <InputError
                                                message={errors?.postal_code}
                                                className="text-red-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Purchase */}
                                    <h3 className="text-xl font-semibold mb-2 mt-4 cursor-pointer flex justify-between items-center">
                                        Purchase Term:
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center space-x-2 px-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                            <input
                                                type="radio"
                                                name="purchase"
                                                value="For Sale"
                                                checked={data.purchase === "For Sale"}
                                                onChange={handleChange}
                                            />
                                            <span>For Sale</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                            <input
                                                type="radio"
                                                name="purchase"
                                                value="For Rent"
                                                checked={data.purchase === "For Rent"}
                                                onChange={handleChange}
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
                                                <label className="flex items-center space-x-2 px-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                                    <input
                                                        type="radio"
                                                        name="sale_type"
                                                        value="New Launch"
                                                        checked={data.sale_type === "New Launch"}
                                                        onChange={handleChange}
                                                    />
                                                    <span>New Launch</span>
                                                </label>
                                                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                                    <input
                                                        type="radio"
                                                        name="sale_type"
                                                        value="Subsale"
                                                        checked={data.sale_type === "Subsale"
                                                        }
                                                        onChange={handleChange}
                                                    />
                                                    <span>Subsale</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <h3 className="text-xl font-semibold mb-2 mt-4 cursor-pointer flex justify-between items-center">
                                        Property Type:
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 col-span-2">
                                        <select
                                            name="property_type"
                                            value={data.property_type}
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
                                            <div>
                                                <InputLabel htmlFor="number_of_units" value="Number of Units" />
                                                <TextInput
                                                    id="number_of_units"
                                                    type="number"
                                                    name="number_of_units"
                                                    placeholder="Number of Units*"
                                                    onChange={(e) => {
                                                        if (e.target.value < 0) { e.target.value = 0; } handleChange(e);
                                                    }}
                                                    value={data.number_of_units}
                                                    required
                                                    min="1"
                                                    step="1"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="p-2 border rounded-md w-full"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "." || e.key === "," || e.key === "e") { e.preventDefault(); }
                                                    }}
                                                />
                                                <InputError
                                                    message={errors?.number_of_units}
                                                    className="text-red-500"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="square_feet" value="Square Feet" />
                                                <TextInput
                                                    id="square_feet"
                                                    type="number"
                                                    name="square_feet"
                                                    placeholder="Square Feet*"
                                                    onChange={(e) => {
                                                        if (e.target.value < 0) {
                                                            e.target.value = 0;
                                                        }
                                                        handleChange(e);
                                                    }}
                                                    value={data.square_feet}
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
                                                <InputError
                                                    message={errors?.square_feet}
                                                    className="text-red-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <InputLabel htmlFor="price" value="Price (RM)" />
                                                <TextInput
                                                    id="price"
                                                    type="number"
                                                    name="price"
                                                    placeholder="Price (RM)*"
                                                    onChange={(e) => {
                                                        if (e.target.value < 0) {
                                                            e.target.value = 0;
                                                        }
                                                        handleChange(e);
                                                    }}
                                                    value={data.price}
                                                    required
                                                    min="1"
                                                    step="0.01"
                                                    className="p-2 border rounded-md w-full"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "." && e.target.value.includes(".")) {
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
                                                    }}
                                                />
                                                <InputError
                                                    message={errors?.price}
                                                    className="text-red-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {isAgentType === "Agent" && (
                                        <div >
                                            <h3 className="text-xl font-semibold mb-2 mt-4 cursor-pointer flex justify-between items-center">
                                                Upload Certificate Photos:
                                            </h3>
                                            <input
                                                type="file"
                                                name="certificate_photos"
                                                onChange={handleChange}
                                                accept="image/*"
                                                multiple
                                                className="p-2 border rounded-md w-full"
                                            />
                                            <InputError
                                                message={errors?.certificate_photos}
                                                className="text-red-500"
                                            />
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

                                    <div >
                                        <h3 className="text-xl font-semibold mb-2 mt-4 cursor-pointer flex justify-between items-center">
                                            Upload Property Photos:
                                        </h3>
                                        <input
                                            type="file"
                                            name="property_photos"
                                            onChange={handleChange}
                                            accept="image/*"
                                            multiple
                                            className="p-2 border rounded-md w-full"
                                        />
                                        <InputError
                                            message={errors?.property_photos}
                                            className="text-red-500"
                                        />
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
                                                                    handleDeletePhoto("property", index)
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
                                onClick={() => setIsAdditionalInfoOpen(
                                    !isAdditionalInfoOpen
                                )}
                            >
                                Additional Information
                                <span>{isAdditionalInfoOpen ? "▽" : "▷"}</span>
                            </h3>
                            {isAdditionalInfoOpen && (
                                <div className="text-[16px]">
                                    <InputLabel htmlFor="each_unit_has_furnace" value="Does each unit have its own furnace?" className="text-[16px] mt-4" />
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <RadioInput
                                                id="each_unit_has_furnace"
                                                name="each_unit_has_furnace"
                                                value={true}
                                                checked={data.each_unit_has_furnace === true}
                                                onChange={handleChange}
                                            />
                                            <span>Yes</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <RadioInput
                                                id="each_unit_has_furnace"
                                                name="each_unit_has_furnace"
                                                value={false}
                                                checked={data.each_unit_has_furnace === false}
                                                onChange={handleChange}
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>

                                    <InputLabel htmlFor="each_unit_has_electrical_meter" value="Does each unit have its own electrical meter?" className="text-[16px] mt-4" />
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <RadioInput
                                                id="each_unit_has_electrical_meter"
                                                name="each_unit_has_electrical_meter"
                                                value={true}
                                                checked={data.each_unit_has_electrical_meter === true}
                                                onChange={handleChange}
                                            />
                                            <span>Yes</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <RadioInput
                                                id="each_unit_has_electrical_meter"
                                                name="each_unit_has_electrical_meter"
                                                value={false}
                                                checked={data.each_unit_has_electrical_meter === false}
                                                onChange={handleChange}
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>

                                    <InputLabel htmlFor="has_onsite_caretaker" value="Is there an on-site caretaker or any direct employees?" className="text-[16px] mt-4" />
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <RadioInput
                                                id="has_onsite_caretaker"
                                                name="has_onsite_caretaker"
                                                value={true}
                                                checked={data.has_onsite_caretaker === true}
                                                onChange={handleChange}
                                            />
                                            <span>Yes</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <RadioInput
                                                id="has_onsite_caretaker"
                                                name="has_onsite_caretaker"
                                                value={false}
                                                checked={data.has_onsite_caretaker === false}
                                                onChange={handleChange}
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>

                                    <InputLabel htmlFor="parking" value="Parking" className="text-[16px] mt-4" />
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <RadioInput
                                                id="parking"
                                                name="parking"
                                                value="Above ground"
                                                checked={data.parking === "Above ground"}
                                                onChange={handleChange}
                                            />
                                            <span>Above ground</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <RadioInput
                                                id="parking"
                                                name="parking"
                                                value="Underground"
                                                checked={data.parking === "Underground"}
                                                onChange={handleChange}
                                            />
                                            <span>Underground</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <RadioInput
                                                id="parking"
                                                name="parking"
                                                value="Both"
                                                checked={data.parking === "Both"}
                                                onChange={handleChange}
                                            />
                                            <span>Both</span>
                                        </label>
                                    </div>

                                    <InputLabel htmlFor="amenities" value="Amenities:" className="text-[16px] mt-4" />
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
                                            "Restaurant",
                                        ].map((amenity) => (
                                            <label
                                                key={amenity}
                                                className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="amenities"
                                                    value={amenity}
                                                    onChange={handleChange}
                                                    checked={data.amenities.includes(amenity)}
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
                                        value={data.other_amenities}
                                        className="p-2 border rounded-md w-full mt-4"
                                    />
                                    <textarea
                                        name="additional_info"
                                        placeholder="Please provide any additional information or comments"
                                        onChange={handleChange}
                                        value={data.additional_info}
                                        className="p-2 border rounded-md w-full mt-4"
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between md:justify-end mt-6">
                            <DangerButton
                                type="button"
                                onClick={handleClose}
                            >
                                Close
                            </DangerButton>
                            <SecondaryButton
                                type="submit"
                                className="ml-4"
                            >
                                Submit
                            </SecondaryButton>
                        </div>
                    </form>
                </div>
            </div >
            <ShowConfirmationModal
                isOpen={showConfirmationModal}
                message="Are you sure you want to submit the form?"
                onClose={handleCancel}
                onConfirm={handleConfirm}
            />
            <ShowSuccessModal
                isOpen={showSuccessModal}
                message="Your property application has been submitted successfully."
                onClose={handleCloseSuccessModal}
            />
        </div >
    );
};

export default PropertyFormModal;
