import React, { useState } from "react";
import axios from "axios";
import ShowSuccessModal from "./ShowSuccessModal";

const PropertyFormModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        relation_to_property: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        phone1: "",
        phone2: "",
        fax: "",
        email: "",
        heard_about_us: "",
        property_name: "",
        property_address_line_1: "",
        property_address_line_2: "",
        property_city: "",
        postal_code: "",
        number_of_units: "",
        total_commercial_units: "",
        total_commercial_space_sqft: "",
        year_built: "",
        developer: "",
        condominium_plan_number: "",
        property_type: "",
        property_styles: [],
        each_unit_has_furnace: false,
        each_unit_has_electrical_meter: false,
        has_onsite_caretaker: false,
        parking: "",
        amenities: [],
        other_amenities: "",
        additional_info: "",
        image: null,
    });

    const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(true);
    const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (
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
            // Handle radio buttons for boolean fields
            setFormData({ ...formData, [name]: value === "true" });
        } else if (type === "file") {
            setFormData({ ...formData, [name]: e.target.files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        // Process each field in formData
        Object.keys(formData).forEach((key) => {
            if (Array.isArray(formData[key])) {
                // Append each element of the array separately for arrays
                formData[key].forEach((item) => data.append(`${key}[]`, item));
            } else if (key === "image" && formData[key] instanceof File) {
                // Check if 'image' is a valid file, then append it
                data.append(key, formData[key]);
            } else if (
                key === "each_unit_has_furnace" ||
                key === "each_unit_has_electrical_meter" ||
                key === "has_onsite_caretaker"
            ) {
                // Convert booleans to integers (1 for true, 0 for false)
                data.append(key, formData[key] ? 1 : 0);
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
            // alert("Property applied successfully!");
            setShowSuccessModal(true); 
        } catch (error) {
            if (error.response && error.response.data.errors) {
                // console.log("Validation Errors:", error.response.data.errors);
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
                                setIsPersonalInfoOpen(!isPersonalInfoOpen)
                            }
                        >
                            Personal Information
                            <span>{isPersonalInfoOpen ? "▽" : "▷"}</span>
                        </h3>
                        {isPersonalInfoOpen && (
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First Name"
                                    onChange={handleChange}
                                    required
                                    className="p-2 border rounded-md w-full"
                                />
                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last Name"
                                    onChange={handleChange}
                                    required
                                    className="p-2 border rounded-md w-full"
                                />
                                <select
                                    name="relation_to_property"
                                    onChange={handleChange}
                                    required
                                    className="p-2 border rounded-md w-full"
                                >
                                    <option value="">
                                        Relation to Property
                                    </option>
                                    <option value="Owner">Owner</option>
                                    <option value="Board Member">
                                        Board Member
                                    </option>
                                    <option value="Developer">Developer</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input
                                    type="text"
                                    name="address_line_1"
                                    placeholder="Address Line 1"
                                    onChange={handleChange}
                                    required
                                    className="p-2 border rounded-md w-full"
                                />
                                <input
                                    type="text"
                                    name="address_line_2"
                                    placeholder="Address Line 2"
                                    onChange={handleChange}
                                    className="p-2 border rounded-md w-full"
                                />
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    onChange={handleChange}
                                    required
                                    className="p-2 border rounded-md w-full"
                                />
                                <input
                                    type="text"
                                    name="phone1"
                                    placeholder="Phone 1"
                                    onChange={handleChange}
                                    required
                                    className="p-2 border rounded-md w-full"
                                />
                                <input
                                    type="text"
                                    name="phone2"
                                    placeholder="Phone 2"
                                    onChange={handleChange}
                                    className="p-2 border rounded-md w-full"
                                />
                                <input
                                    type="text"
                                    name="fax"
                                    placeholder="Fax"
                                    onChange={handleChange}
                                    className="p-2 border rounded-md w-full"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    onChange={handleChange}
                                    required
                                    className="p-2 border rounded-md w-full"
                                />
                            </div>
                        )}
                    </div>

                    <hr className="my-10 border-t border-gray-300" />

                    <div>
                        <h3
                            className="text-xl font-semibold mt-6 mb-2 cursor-pointer flex justify-between items-center"
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
                                        name="postal_code"
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
                                        name="condominium_plan_number"
                                        placeholder="Condominium Plan Number"
                                        onChange={handleChange}
                                        className="p-2 border rounded-md w-full"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold mt-6 mb-2">
                                    Property Type:
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                        <input
                                            type="radio"
                                            name="property_type"
                                            value="Conventional Condominium"
                                            onChange={handleChange}
                                            className="text-blue-500"
                                        />
                                        <span>Conventional Condominium</span>
                                    </label>
                                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                        <input
                                            type="radio"
                                            name="property_type"
                                            value="Bare Land Condominium"
                                            onChange={handleChange}
                                            className="text-blue-500"
                                        />
                                        <span>Bare Land Condominium</span>
                                    </label>
                                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                        <input
                                            type="radio"
                                            name="property_type"
                                            value="Commercial"
                                            onChange={handleChange}
                                            className="text-blue-500"
                                        />
                                        <span>Commercial</span>
                                    </label>
                                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                        <input
                                            type="radio"
                                            name="property_type"
                                            value="Other / Not Sure"
                                            onChange={handleChange}
                                            className="text-blue-500"
                                        />
                                        <span>Other / Not Sure</span>
                                    </label>
                                </div>

                                <h3 className="text-xl font-semibold mt-6 mb-2">
                                    Property Style:
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        "Duplex",
                                        "Townhouse",
                                        "Carriage Style",
                                        "Low-rise",
                                        "High-rise",
                                        "Mixed Use (Commercial & Residential)",
                                        "Office Building",
                                        "Shopping Mall / Plaza / Common",
                                    ].map((style) => (
                                        <label
                                            key={style}
                                            className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-green-50 transition"
                                        >
                                            <input
                                                type="checkbox"
                                                name="property_styles"
                                                value={style}
                                                onChange={handleChange}
                                                className="text-green-500"
                                            />
                                            <span>{style}</span>
                                        </label>
                                    ))}
                                </div>

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
                                            className="text-blue-500"
                                        />
                                        <span>Yes</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="each_unit_has_furnace"
                                            value={false}
                                            onChange={handleChange}
                                            className="text-blue-500"
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
                                            className="text-blue-500"
                                        />
                                        <span>Yes</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="each_unit_has_electrical_meter"
                                            value={false}
                                            onChange={handleChange}
                                            className="text-blue-500"
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
                                            className="text-blue-500"
                                        />
                                        <span>Yes</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="has_onsite_caretaker"
                                            value={false}
                                            onChange={handleChange}
                                            className="text-blue-500"
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
                                            className="text-blue-500"
                                        />
                                        <span>Above ground</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="parking"
                                            value="Underground"
                                            onChange={handleChange}
                                            className="text-blue-500"
                                        />
                                        <span>Underground</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="parking"
                                            value="Both"
                                            onChange={handleChange}
                                            className="text-blue-500"
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
                                            className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-yellow-50 transition"
                                        >
                                            <input
                                                type="checkbox"
                                                name="amenities"
                                                value={amenity}
                                                onChange={handleChange}
                                                className="text-yellow-500"
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

                                <div className="mt-4">
                                    <label className="block font-semibold">
                                        Upload Image:
                                    </label>
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleChange}
                                        accept="image/*"
                                        className="p-2 border rounded-md w-full"
                                    />
                                </div>
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
                            className="bg-blue-500 text-white px-6 py-2 rounded-md"
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
