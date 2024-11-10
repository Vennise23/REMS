import React, { useEffect, useState } from "react";
import axios from "axios";
import ShowSuccessModal from "./ShowSuccessModal";
import "./../../css/app.css";

const PropertyFormModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
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
    });

    const [isAgentType, setIsAgentType] = useState("");
    const [purchaseTerm, setPurchase_term] = useState("");
    const [certificatePhotoPreview, setCertificatePhotoPreview] = useState([]);
    const [propertyPhotoPreview, setPropertyPhotoPreview] = useState([]);
    const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(true);
    const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsPostalCode, setSuggestionsPostalCode] = useState([]);

    const handleChange = async (e) => {
        const { name, value, type, files, checked } = e.target;

        if (name === "isAgentType") {
            setIsAgentType(value);
        } else if (name === "purchase") {
            // Update both the formData and purchaseTerm when purchase type is selected
            setFormData({ ...formData, purchase: value });
            setPurchase_term(value); // This controls whether Sale Types should show
        } else if (
            type === "radio" &&
            (name === "sale_type")
        ) {
            // Handle sale type radio buttons
            setFormData({ ...formData, sale_type: value });
        } else if (type === "file") {
            // For certificate photos preview
            if (name === "certificate_photos") {
                const filePreviews = Array.from(files).map((file) =>
                    URL.createObjectURL(file)
                );
                setCertificatePhotoPreview(filePreviews);
            }
            // For property photos preview
            if (name === "property_photos") {
                const filePreviews = Array.from(files).map((file) =>
                    URL.createObjectURL(file)
                );
                setPropertyPhotoPreview(filePreviews);
            }
            // Handle multiple file uploads for photos
            setFormData({ ...formData, [name]: files });
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

    const handlePostalCodeChange = (e) => {
        const { value } = e.target;
        setFormData({ ...formData, postal_code: value });
        if (value.length > 2) {
            fetchSuggestions(value, "postalCode");
        } else {
            setSuggestionsPostalCode([]);
        }
    };

    const fetchSuggestions = async (query, type) => {
        try {
            const url =
                type === "address"
                    ? `https://cn.bing.com/api/v6/Places/AutoSuggest?q=${query}&appid=D41D8CD98F00B204E9800998ECF8427E1FBE79C2&mv8cid=9bbb826b-bb4c-46f9-9890-d439b0399f73&mv8ig=FDA6A640F3804207B6703755C5045A66&localMapView=1.7949410094884541,102.78705596923783,1.6583606279413772,104.10472869872973&localcircularview=1.7265548706054688,103.44584655761719,100&count=5&structuredaddress=true&types=&histcnt=&favcnt=&ptypes=favorite&clientid=370934328861623A3A80213189F66348&abbrtext=1`
                    : `https://cn.bing.com/api/v6/Places/AutoSuggest?q=${query}&appid=D41D8CD98F00B204E9800998ECF8427E1FBE79C2&mv8cid=9bbb826b-bb4c-46f9-9890-d439b0399f73&mv8ig=FDA6A640F3804207B6703755C5045A66&localMapView=1.7949410094884541,102.78705596923783,1.6583606279413772,104.10472869872973&localcircularview=1.7265548706054688,103.44584655761719,100&count=5&structuredaddress=true&types=&histcnt=&favcnt=&ptypes=favorite&clientid=370934328861623A3A80213189F66348&abbrtext=1`;

            const response = await fetch(url);
            const data = await response.json();
            console.log("data : ", data);

            if (data.value && Array.isArray(data.value)) {
                if (type === "address") {
                    setSuggestions(data.value);
                } else {
                    setSuggestionsPostalCode(data.value);
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

    const handleSuggestionClick = (suggestion) => {
        console.log("suggestion: ", suggestion);

        setFormData({
            ...formData,
            property_address_line_1:
                suggestion.streetAddress ||
                suggestion.address?.streetAddress ||
                "",
            property_address_line_2:
                suggestion.addressLocality ||
                suggestion.address?.addressLocality ||
                "",
            city:
                suggestion.addressRegion ||
                suggestion.address?.addressRegion ||
                "",
        });

        setSuggestions([]);
    };

    const handleSuggestionPostalCodeClick = (suggestion) => {
        console.log("suggestion: ", suggestion);

        setFormData({
            ...formData,
            postal_code:
                suggestion.postalCode || suggestion.address?.postalCode || "",
        });

        setSuggestionsPostalCode([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        console.log("data : ", data);
        // Process each field in formData
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
                data.append(key, formData[key] ? 1 : 0);
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/apply-property", // change your url here
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setShowSuccessModal(true);
        } catch (error) {
            if (error.response && error.response.data.errors) {
                // Handle validation errors from the server
                const validationErrors = error.response.data.errors;
                console.error("Validation Errors:", validationErrors);
                alert("Error: Please check the form for validation errors.");
            } else {
                console.log("Submission Error:", error);
                alert("Error submitting the form");
            }
        }
    };
     







    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-2xl shadow-lg overflow-auto max-h-[90vh]">
                <h2 className="text-2xl font-bold text-center mb-6">
                    Apply for Property
                </h2>

                <form onSubmit={handleSubmit}>
                    <div>
                        <h3
                            className="text-xl font-semibold mb-2 cursor-pointer flex justify-between items-center"
                            onClick={() =>
                                setIsPropertyDetailsOpen(!isPropertyDetailsOpen)
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
                                            onChange={handleChange}
                                            required
                                            className="p-2 border rounded-md w-full"
                                        />
                                    </div>

                                    <select
                                        name="isAgentType"
                                        onChange={handleChange}
                                        className="p-2 border rounded-md w-full"
                                        required
                                    >
                                        <option value="" disabled>
                                            Select Property Type
                                        </option>
                                        <option value="non-agent">
                                            Non Agent
                                        </option>
                                        <option value="agent">Agent</option>
                                    </select>

                                    <div className="grid grid-cols-1 gap-4 col-span-2 relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="property_address_line_1"
                                                placeholder="Property Address Line 1*"
                                                value={
                                                    formData.property_address_line_1
                                                }
                                                onChange={handleAddressChange}
                                                required
                                                className="p-2 border rounded-md w-full"
                                            />
                                            {/* Display suggestions */}
                                            {suggestions.length > 0 && (
                                                <ul className="suggestions-list absolute bg-white border border-gray-300 w-full max-h-40 overflow-auto z-10">
                                                    {suggestions.map(
                                                        (suggestion, index) => (
                                                            <li
                                                                key={index}
                                                                onClick={() =>
                                                                    handleSuggestionClick(
                                                                        suggestion
                                                                    )
                                                                }
                                                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                                            >
                                                                <div className="font-bold">
                                                                    {suggestion.streetAddress ||
                                                                        suggestion
                                                                            .address
                                                                            ?.streetAddress ||
                                                                        "Unknown Street"}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {suggestion.addressLocality ||
                                                                        suggestion
                                                                            .address
                                                                            ?.addressLocality}
                                                                    ,{" "}
                                                                    {suggestion.addressRegion ||
                                                                        suggestion.addressRegion}
                                                                </div>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            name="property_address_line_2"
                                            placeholder="Property Address Line 2*"
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
                                            onChange={handlePostalCodeChange}
                                            required
                                            className="p-2 border rounded-md w-full"
                                        />
                                        {suggestionsPostalCode.length > 0 && (
                                            <ul className="suggestions-list absolute bg-white border border-gray-300 w-full max-h-40 overflow-auto z-10">
                                                {suggestionsPostalCode.map(
                                                    (suggestion, index) => (
                                                        <li
                                                            key={index}
                                                            onClick={() =>
                                                                handleSuggestionPostalCodeClick(
                                                                    suggestion
                                                                )
                                                            }
                                                            className="p-2 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <div className="font-bold">
                                                                {suggestion.postalCode ||
                                                                    suggestion
                                                                        .address
                                                                        ?.postalCode}{" "}
                                                                {suggestion.addressLocality ||
                                                                    suggestion
                                                                        .address
                                                                        ?.addressLocality}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {suggestion.addressRegion ||
                                                                    suggestion
                                                                        .address
                                                                        ?.addressRegion}{" "}
                                                                {suggestion.addressCountry ||
                                                                    suggestion
                                                                        .address
                                                                        ?.addressCountry}
                                                            </div>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}
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
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="p-2 border rounded-md w-full"
                                        />

                                        <input
                                            type="number"
                                            name="square_feet"
                                            placeholder="Square Feet*"
                                            onChange={handleChange}
                                            min="0"
                                            className="p-2 border rounded-md w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="Price (RM)*"
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="p-2 border rounded-md w-full"
                                        />
                                    </div>
                                </div>

                                {isAgentType === "agent" && (
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
                                        {/* Show certificate photo previews */}
                                        {certificatePhotoPreview.length > 0 && (
                                            <div className="mt-4 grid grid-cols-3 gap-2">
                                                {certificatePhotoPreview.map(
                                                    (src, index) => (
                                                        <img
                                                            key={index}
                                                            src={src}
                                                            alt={`Certificate Preview ${index}`}
                                                            className="w-full h-auto object-cover rounded-md"
                                                        />
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
                                    {/* Show property photo previews */}
                                    {propertyPhotoPreview.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            {propertyPhotoPreview.map(
                                                (src, index) => (
                                                    <img
                                                        key={index}
                                                        src={src}
                                                        alt={`Property Preview ${index}`}
                                                        className="w-full h-auto object-cover rounded-md"
                                                    />
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
                                setIsAdditionalInfoOpen(!isAdditionalInfoOpen)
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
                                            className="text-red-500"
                                        />
                                        <span>No</span>
                                    </label>
                                </div>

                                <h3 className="font-semibold mt-4 mb-2">
                                    Is there an on-site caretaker or any direct
                                    employees?
                                </h3>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="has_onsite_caretaker"
                                            value={true}
                                            onChange={handleChange}
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
                                    className="p-2 border rounded-md w-full mt-4"
                                />
                                <textarea
                                    name="additional_info"
                                    placeholder="Please provide any additional information or comments"
                                    onChange={handleChange}
                                    className="p-2 border rounded-md w-full mt-4"
                                ></textarea>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-4"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="bg-red-500 text-white px-6 py-2 rounded-md"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
            <ShowSuccessModal
                isOpen={showSuccessModal}
                message="Your property application has been submitted successfully."
                onClose={handleCloseSuccessModal}
            />
        </div>
    );
};

export default PropertyFormModal;
