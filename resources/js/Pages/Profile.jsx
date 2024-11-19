import React, { useState } from "react";
import { useForm, Head } from "@inertiajs/react";
import Header from "@/Components/HeaderMenu";
import UserSidebar from "@/Components/UserSidebar";
import axios from "axios";

export default function Profile({ auth, user }) {
    const originalEmail = user.email; // Define the original email here
    const { data, setData, post, processing } = useForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        ic_number: user.ic_number || "",
        age: user.age || "",
        born_date: user.born_date || "",
        phone: user.phone || "",
        address_line_1: user.address_line_1 || "",
        address_line_2: user.address_line_2 || "",
        city: user.city || "",
        postal_code: user.postal_code || "",
        profile_picture: null,
    });

    const [formErrors, setFormErrors] = useState({});
    const [isIC, setIsIC] = useState(false);

    const validateFields = (field, value) => {
        let errors = { ...formErrors };

        if (field === "firstname" || field === "lastname") {
            if (data.firstname === data.lastname) {
                errors["nameMatch"] = "First name and last name cannot be the same.";
            } else {
                delete errors["nameMatch"];
            }
        }

        if (field === "age") {
            const age = parseInt(value);
            if (age < 1 || age > 100) {
                errors["age"] = "Age must be between 1 and 100.";
            } else {
                delete errors["age"];
            }
        }

        if (field === "phone" && /\D/.test(value)) {
            errors["phone"] = "Phone number can only contain digits.";
        } else {
            delete errors["phone"];
        }

        setFormErrors(errors);
    };

    const handleChange = (field, value) => {
        setData(field, value);
        validateFields(field, value);

        // Check email uniqueness only if the email is different from the original
        if (field === "email" && value !== originalEmail) {
            checkEmailUniqueness(value);
        } else if (field === "email" && value === originalEmail) {
            // If email is reverted to original, clear any email errors
            setFormErrors((prevErrors) => {
                const { email, ...rest } = prevErrors;
                return rest;
            });
        }
    };

    const checkEmailUniqueness = async (email) => {
        try {
            const response = await axios.post(route("profile.checkEmail"), { email });
            if (response.data.exists) {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    email: "This email is already registered. Please use a different email.",
                }));
            } else {
                setFormErrors((prevErrors) => {
                    const { email, ...rest } = prevErrors;
                    return rest;
                });
            }
        } catch (error) {
            console.error("Error checking email uniqueness:", error);
        }
    };

    const handleICorPassport = (e) => {
        const value = e.target.value;
        console.log("Function called with value:", value);

        // Update the IC number field directly without any conditions to allow user input
        setData("ic_number", value);

        // Remove hyphens for validation
        const cleanedValue = value.replace(/-/g, '');

        // Check if the input resembles an IC or passport number
        const isICFormat = /^\d{12}$/.test(cleanedValue); // 12 digits, no hyphens
        const isPassportFormat = /^[A-Z]\d{7,8}$/.test(value); // Alphanumeric passport

        if (isICFormat || isPassportFormat) {
            console.log(isICFormat ? "Detected IC format" : "Detected Passport format");
            setIsIC(isICFormat);

            // Check if the input resembles an IC format (12 numeric characters)
            if (isICFormat) {
                // Parse IC format to extract birth year, month, and day
                const year = parseInt(value.slice(0, 2), 10);
                const month = parseInt(value.slice(2, 4), 10);
                const day = parseInt(value.slice(4, 6), 10);

                const currYear = new Date().getFullYear();
                const currYear_cutoff = currYear % 100; // get the last two digit of current year.
                const birthYear = year > currYear_cutoff ? 1900 + year : 2000 + year;
                const birthDate = new Date(birthYear, month - 1, day);
                const formattedDate = birthDate.toISOString().split("T")[0]; // YYYY-MM-DD format

                console.log("Birth Date Calculated:", formattedDate);
    
                // Update state
                setData((prevData) => ({
                    ...prevData,
                    born_date: formattedDate,
                    age: currYear - birthYear,
                }));
            }
        } else {
            console.log("Invalid format. Not an IC or Passport number.");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (data.firstname === data.lastname) {
            alert("First name and last name cannot be the same.");
            return;
        }

        post(route("profile.update"), {
            onSuccess: () => {
                window.location.reload();
            },
        });

    };

    const userImage = data.profile_picture
        ? URL.createObjectURL(data.profile_picture)
        : auth.user.profile_picture
            ? `/storage/${auth.user.profile_picture}`
            : "https://ui-avatars.com/api/?name=User&background=random";

    return (
        <>
            <Head title="Profile Edit" />
            <Header auth={auth} />

            <main className="flex flex-col md:flex-row pt-20 min-h-screen bg-gray-100">
                <UserSidebar />

                <div className="flex-1 flex justify-center p-6 md:p-12">
                    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 rounded shadow-lg">
                        <div className="col-span-1 text-center">
                            <div
                                className="w-32 h-32 rounded-full mx-auto bg-cover bg-center"
                                style={{ backgroundImage: `url(${userImage})` }}
                            ></div>
                            <label className="block mt-2 text-sm text-gray-600 cursor-pointer">
                                Edit Picture
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setData("profile_picture", e.target.files[0])}
                                />
                            </label>
                            <p className="text-lg font-semibold mt-4">{`${data.firstname} ${data.lastname}`}</p>
                            <p className="text-gray-600">{data.phone}</p>
                            <p className="text-gray-600">{data.email}</p>
                        </div>

                        <div className="col-span-2">
                            <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.firstname}
                                            onChange={(e) => handleChange("firstname", e.target.value)}
                                        />
                                        {formErrors.nameMatch && (
                                            <div className="text-red-500 text-sm">{formErrors.nameMatch}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.lastname}
                                            onChange={(e) => handleChange("lastname", e.target.value)}
                                        />
                                        {formErrors.nameMatch && (
                                            <div className="text-red-500 text-sm">{formErrors.nameMatch}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                        />
                                        {formErrors.email && (
                                            <div className="text-red-500 text-sm">{formErrors.email}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">IC Number / Passport</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.ic_number}
                                            onChange={handleICorPassport}
                                        />
                                    </div>


                                    <div className="mb-4">
                                        <label className="block text-gray-700">Age</label>
                                        <input
                                            type="number"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.age}
                                            onChange={(e) => handleChange("age", e.target.value)}
                                            min="1"
                                            max="100"
                                        />
                                        {formErrors.age && (
                                            <div className="text-red-500 text-sm">{formErrors.age}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Born Date</label>
                                        <input
                                            type="date"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.born_date}
                                            disabled={isIC}
                                            onChange={(e) => setData("born_date", e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Phone Number</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.phone}
                                            onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ''))}
                                        />
                                        {formErrors.phone && (
                                            <div className="text-red-500 text-sm">{formErrors.phone}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Address Line 1</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.address_line_1}
                                            onChange={(e) => setData("address_line_1", e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Address Line 2</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.address_line_2}
                                            onChange={(e) => setData("address_line_2", e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">City</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.city}
                                            onChange={(e) => setData("city", e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Postal Code</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border rounded p-2"
                                            value={data.postal_code}
                                            onChange={(e) => setData("postal_code", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end mt-6">
                                    <button
                                        type="submit"
                                        className="bg-orange-500 text-white px-6 py-2 rounded-full"
                                        disabled={processing}
                                    >
                                        {processing ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
