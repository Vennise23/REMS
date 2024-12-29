import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PropertyEditModal({ isOpen, onClose, onSubmit, property }) {
    const [formData, setFormData] = useState({
        property_name: "",
        agent_type: "",
        property_address_line_1: "",
        property_address_line_2: "",
        city: "",
        postal_code: "",
        purchase: "",
        property_type: "",
        number_of_units: "",
        square_feet: "",
        price: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (property) {
            setFormData({
                property_name: property.property_name || "",
                agent_type: property.agent_type || "",
                property_address_line_1: property.property_address_line_1 || "",
                property_address_line_2: property.property_address_line_2 || "",
                city: property.city || "",
                postal_code: property.postal_code || "",
                purchase: property.purchase || "",
                property_type: property.property_type || "",
                number_of_units: property.number_of_units || "",
                square_feet: property.square_feet || "",
                price: property.price || "",
            });
        }
    }, [property]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`/properties/${property.id}`, formData); // Adjust endpoint
            console.log("Update successful:", response.data);
            onSubmit(response.data); // Notify parent component
            onClose(); // Close modal
        } catch (error) {
            console.error("Error updating property:", error);
            alert("Failed to update property. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-10/12 max-w-2xl p-6">
                <h2 className="text-2xl font-bold text-center mb-6">Edit Property</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <input
                            type="text"
                            name="property_name"
                            value={formData.property_name}
                            onChange={handleChange}
                            placeholder="Property Name*"
                            className="p-2 border rounded-md w-full"
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <input
                            type="text"
                            name="property_address_line_1"
                            value={formData.property_address_line_1}
                            onChange={handleChange}
                            placeholder="Address Line 1*"
                            className="p-2 border rounded-md w-full"
                            required
                        />
                        <input
                            type="text"
                            name="property_address_line_2"
                            value={formData.property_address_line_2}
                            onChange={handleChange}
                            placeholder="Address Line 2"
                            className="p-2 border rounded-md w-full mt-2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City*"
                            className="p-2 border rounded-md w-full"
                            required
                        />
                        <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            placeholder="Postal Code*"
                            className="p-2 border rounded-md w-full"
                            required
                        />
                    </div>
                    {/* Other input fields */}
                    <div className="flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-4"
                            disabled={loading}
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded-md"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
