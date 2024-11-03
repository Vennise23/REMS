import React, { useState } from "react";
import axios from "axios";
import ShowSuccessModal from "./ShowSuccessModal";

const PropertyFormModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        property_name: "",
        property_title: "",
        property_type: "",
        property_address_line_1: "",
        property_address_line_2: "",
        property_city: "",
        property_postal_code: "",
        number_of_units: "",
        total_commercial_units: "",
        total_commercial_space_sqft: "",
        year_built: "",
        developer: "",
        certificate_number: "",
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

    const [certificatePhotoPreview, setCertificatePhotoPreview] = useState([]);
    const [propertyPhotoPreview, setPropertyPhotoPreview] = useState([]);
    const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(true);
    const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, files, checked } = e.target;

        if (type === "file") {
            // For certificate photos preview
            if (name === "certificate_photos") {
                const filePreviews = Array.from(files).map(file => URL.createObjectURL(file));
                setCertificatePhotoPreview(filePreviews);
            }
            // For property photos preview
            if (name === "property_photos") {
                const filePreviews = Array.from(files).map(file => URL.createObjectURL(file));
                setPropertyPhotoPreview(filePreviews);
            }
            // Handle multiple file uploads for photos
            setFormData({ ...formData, [name]: files });
        } else if (type === "checkbox") {
            // Handle checkbox inputs for amenities
            setFormData({
                ...formData,
                [name]: formData[name].includes(value)
                    ? formData[name].filter((item) => item !== value)
                    : [...formData[name], value],
            });
        } else if (type === "radio") {
            setFormData({ ...formData, [name]: value === "true" });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        // Process each field in formData
        Object.keys(formData).forEach((key) => {
            if (key === "certificate_photos" || key === "property_photos") {
                // Handle file arrays (multiple photos)
                Array.from(formData[key]).forEach((file) => {
                    data.append(`${key}[]`, file);
                });
            } else if (Array.isArray(formData[key])) {
                // Append arrays like amenities
                formData[key].forEach((item) => data.append(`${key}[]`, item));
            } else {
                // Append all other fields normally
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await axios.post("/apply-property", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setShowSuccessModal(true);
        } catch (error) {
            if (error.response && error.response.data.errors) {
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
                                    <input
                                        type="text"
                                        name="property_name"
                                        placeholder="Property Name"
                                        onChange={handleChange}
                                        required
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="text"
                                        name="property_title"
                                        placeholder="Property Title"
                                        onChange={handleChange}
                                        required
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="text"
                                        name="property_address_line_1"
                                        placeholder="Property Address Line 1"
                                        onChange={handleChange}
                                        required
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="text"
                                        name="property_address_line_2"
                                        placeholder="Property Address Line 2"
                                        onChange={handleChange}
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="text"
                                        name="property_city"
                                        placeholder="City"
                                        onChange={handleChange}
                                        required
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="text"
                                        name="property_postal_code"
                                        placeholder="Postal Code"
                                        onChange={handleChange}
                                        required
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="number"
                                        name="number_of_units"
                                        placeholder="Number of Units"
                                        onChange={handleChange}
                                        required
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="number"
                                        name="total_commercial_units"
                                        placeholder="Total Commercial Units"
                                        onChange={handleChange}
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="number"
                                        name="total_commercial_space_sqft"
                                        placeholder="Total Commercial Space (sq ft)"
                                        onChange={handleChange}
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="number"
                                        name="year_built"
                                        placeholder="Year Built"
                                        onChange={handleChange}
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="text"
                                        name="developer"
                                        placeholder="Developer"
                                        onChange={handleChange}
                                        className="p-2 border rounded-md w-full"
                                    />
                                    <input
                                        type="text"
                                        name="certificate_number"
                                        placeholder="Certificate Number"
                                        onChange={handleChange}
                                        className="p-2 border rounded-md w-full"
                                    />
                                </div>

                                <h3 className="text-xl font-semibold mt-6 mb-2">
                                    Property Type:
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition">
                                        <input
                                            type="radio"
                                            name="property_type"
                                            value="Conventional Condominium"
                                            onChange={handleChange}
                                            className="text-red-500"
                                        />
                                        <span>Conventional Condominium</span>
                                    </label>
                                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition">
                                        <input
                                            type="radio"
                                            name="property_type"
                                            value="Bare Land Condominium"
                                            onChange={handleChange}
                                            className="text-red-500"
                                        />
                                        <span>Bare Land Condominium</span>
                                    </label>
                                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition">
                                        <input
                                            type="radio"
                                            name="property_type"
                                            value="Commercial"
                                            onChange={handleChange}
                                            className="text-red-500"
                                        />
                                        <span>Commercial</span>
                                    </label>
                                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition">
                                        <input
                                            type="radio"
                                            name="property_type"
                                            value="Other / Not Sure"
                                            onChange={handleChange}
                                            className="text-red-500"
                                        />
                                        <span>Other / Not Sure</span>
                                    </label>
                                </div>

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
                                            {certificatePhotoPreview.map((src, index) => (
                                                <img
                                                    key={index}
                                                    src={src}
                                                    alt={`Certificate Preview ${index}`}
                                                    className="w-full h-auto object-cover rounded-md"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

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
                                            {propertyPhotoPreview.map((src, index) => (
                                                <img
                                                    key={index}
                                                    src={src}
                                                    alt={`Property Preview ${index}`}
                                                    className="w-full h-auto object-cover rounded-md"
                                                />
                                            ))}
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