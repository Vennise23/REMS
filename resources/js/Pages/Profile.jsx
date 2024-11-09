import React, { useState } from "react";
import { useForm, Link, Head } from "@inertiajs/react";

export default function Profile({ auth, user }) {
    const { data, setData, post, errors, processing } = useForm({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        ic_number: user.ic_number,
        age: user.age,
        born_date: user.born_date,
        phone: user.phone,
        address_line1: user.address_line1,
        address_line2: user.address_line2,
        city: user.city,
        postal_code: user.postal_code,
        profile_picture: null, // For file upload
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("profile.update"));
    };

    const handleFileChange = (e) => {
        setData("profile_picture", e.target.files[0]);
    };

    return (
        <>
            <Head title="User Profile" />
            <header className="bg-gray-100 p-6 border-b border-gray-300 fixed top-0 left-0 w-full z-50 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Logo and navbar can be added here if needed */}
                </div>
            </header>

            <main className="pt-32 mt-12 min-h-screen bg-gray-100 flex flex-col items-center">
                <div className="max-w-2xl w-full bg-white p-8 rounded shadow">
                    <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="mb-4">
                            <label className="block text-gray-700">First Name</label>
                            <input
                                type="text"
                                className="mt-1 block w-full"
                                value={data.firstname}
                                onChange={(e) => setData("firstname", e.target.value)}
                            />
                            {errors.firstname && <div className="text-red-500 text-sm">{errors.firstname}</div>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Last Name</label>
                            <input
                                type="text"
                                className="mt-1 block w-full"
                                value={data.lastname}
                                onChange={(e) => setData("lastname", e.target.value)}
                            />
                            {errors.lastname && <div className="text-red-500 text-sm">{errors.lastname}</div>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                            />
                            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                        </div>
                        {/* Additional fields for other information */}
                        <div className="mb-4">
                            <label className="block text-gray-700">Profile Picture</label>
                            <input
                                type="file"
                                className="mt-1 block w-full"
                                onChange={handleFileChange}
                            />
                            {errors.profile_picture && <div className="text-red-500 text-sm">{errors.profile_picture}</div>}
                        </div>
                        <div className="flex items-center justify-end mt-4">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                disabled={processing}
                            >
                                {processing ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
