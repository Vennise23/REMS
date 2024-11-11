import React from "react";
import { useForm, Head } from "@inertiajs/react";
import Header from "@/Components/HeaderMenu";

export default function Profile({ auth, user }) {
    const { data, setData, post, patch, errors, processing } = useForm({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        ic_number: user.ic_number,
        age: user.age,
        born_date: user.born_date,
        phone: user.phone,
        address_line_1: user.address_line_1,
        address_line_2: user.address_line_2,
        city: user.city,
        postal_code: user.postal_code,
        profile_picture: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("profile.update"), {
            onSuccess: () => {
                window.location.reload();
            }
        });
    };

    const handleFileChange = (e) => {
        setData("profile_picture", e.target.files[0]);
    };

    return (
        <>
            <Head title="Profile Edit" />
            <Header auth={auth} />

            <main className="pt-32 mt-12 min-h-screen bg-gray-100 flex flex-col items-center">
                <div className="max-w-2xl w-full bg-white p-8 rounded shadow">
                    <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="mb-4">
                            <label className="block text-gray-700">First Name</label>
                            <input
                                type="text"
                                className="mt-1 block w-full"
                                value={data.firstname}
                                onChange={(e) => setData("firstname", e.target.value)}
                            />
                            {errors.firstname && (
                                <div className="text-red-500 text-sm">{errors.firstname}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Last Name</label>
                            <input
                                type="text"
                                className="mt-1 block w-full"
                                value={data.lastname}
                                onChange={(e) => setData("lastname", e.target.value)}
                            />
                            {errors.lastname && (
                                <div className="text-red-500 text-sm">{errors.lastname}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                            />
                            {errors.email && (
                                <div className="text-red-500 text-sm">{errors.email}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">IC Number</label>
                            <input
                                type="text"
                                className="mt-1 block w-full"
                                value={data.ic_number}
                                onChange={(e) => setData("ic_number", e.target.value)}
                            />
                            {errors.ic_number && (
                                <div className="text-red-500 text-sm">{errors.ic_number}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Age</label>
                            <input
                                type="number"
                                className="mt-1 block w-full"
                                value={data.age}
                                onChange={(e) => setData("age", e.target.value)}
                            />
                            {errors.age && (
                                <div className="text-red-500 text-sm">{errors.age}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Born Date</label>
                            <input
                                type="date"
                                className="mt-1 block w-full"
                                value={data.born_date}
                                onChange={(e) => setData("born_date", e.target.value)}
                            />
                            {errors.born_date && (
                                <div className="text-red-500 text-sm">{errors.born_date}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Phone</label>
                            <input
                                type="tel"
                                className="mt-1 block w-full"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                            />
                            {errors.phone && (
                                <div className="text-red-500 text-sm">{errors.phone}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Address Line 1</label>
                            <input
                                type="text"
                                className="mt-1 block w-full"
                                value={data.address_line_1}
                                onChange={(e) => setData("address_line_1", e.target.value)}
                            />
                            {errors.address_line1 && (
                                <div className="text-red-500 text-sm">{errors.address_line_1}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Address Line 2</label>
                            <input
                                type="text"
                                className="mt-1 block w-full"
                                value={data.address_line_2}
                                onChange={(e) => setData("address_line_2", e.target.value)}
                            />
                            {errors.address_line2 && (
                                <div className="text-red-500 text-sm">{errors.address_line_2}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">City</label>
                            <input
                                type="text"
                                className="mt-1 block w-full"
                                value={data.city}
                                onChange={(e) => setData("city", e.target.value)}
                            />
                            {errors.city && (
                                <div className="text-red-500 text-sm">{errors.city}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Postal Code</label>
                            <input
                                type="text"
                                className="mt-1 block w-full"
                                value={data.postal_code}
                                onChange={(e) => setData("postal_code", e.target.value)}
                            />
                            {errors.postal_code && (
                                <div className="text-red-500 text-sm">{errors.postal_code}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Profile Picture</label>
                            <input
                                type="file"
                                className="mt-1 block w-full"
                                onChange={handleFileChange}
                            />
                            {errors.profile_picture && (
                                <div className="text-red-500 text-sm">{errors.profile_picture}</div>
                            )}
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
