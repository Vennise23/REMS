import { useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head } from "@inertiajs/react";
import loginImage from "/resources/img/image2.png";
import React, { useState, useEffect } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [existingUsers, setExistingUsers] = useState([]);

    const [gradientStyle, setGradientStyle] = useState({
        background: "linear-gradient(to top left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.5))",
        backgroundSize: "200% 200%",
        animation: "gradientShift 3s infinite alternate ease-in-out",
    });

    // Fetch existing users from the API
    useEffect(() => {
        axios
            .get("/api/existing-users")
            .then((response) => {
                setExistingUsers(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the existing users:", error);
            });

        const styleSheet = document.createElement("style");
        styleSheet.innerHTML = `
                    @keyframes gradientShift {
                        0% {
                            background-position: bottom right;
                        }
                        100% {
                            background-position: top left;
                        }
                    }
                `;
        document.head.appendChild(styleSheet);
    }, []);

    const validateField = (field, value) => {
        if (field === "firstname" || field === "lastname") {
            if (data.firstname === data.lastname) {
                setError("firstname", "First name and last name cannot be the same");
                setError("lastname", "First name and last name cannot be the same");
            } else {
                clearErrors("firstname");
                clearErrors("lastname");
            }

            const isExistingName = existingUsers.some(
                (user) =>
                    user.firstname === (field === "firstname" ? value : data.firstname) &&
                    user.lastname === (field === "lastname" ? value : data.lastname)
            );

            if (isExistingName) {
                setError("firstname", "This name has already been registered, please use a different name");
                setError("lastname", "This name has already been registered, please use a different name");
            } else if (data.firstname !== data.lastname) {
                clearErrors("firstname");
                clearErrors("lastname");
            }
        }

        if (field === "email") {
            // First check for @ and .com
            if (!value.includes('@') || !value.toLowerCase().endsWith('.com')) {
                setError("email", "Email must contain '@' and end with '.com'");
                return;
            }

            // Then check full email pattern
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/i;
            if (!emailPattern.test(value)) {
                setError("email", "Please enter a valid email address (e.g., user@example.com)");
            } else {
                clearErrors("email");

                // Check if email already exists
                const isExistingEmail = existingUsers.some((user) => user.email === value);
                if (isExistingEmail) {
                    setError("email", "This email has already been registered, please use a different email");
                }
            }
        }

        if (field === "password") {
            if (value.length < 8) {
                setError("password", "Password must be at least 8 characters long");
            } else {
                clearErrors("password");
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
        validateField(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("register"));
    };


    return (
        <GuestLayout>
            <Head title="Register" />
            <div className="flex flex-col md:flex-row h-auto bg-transparent ">
                <div
                    className="w-full sm:w-auto md:min-w-[600px] min-h-fit max-w-md sm:max-w-lg mx-auto p-8 rounded-lg shadow-md flex flex-col justify-center relative overflow-hidden"
                    style={gradientStyle}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => window.history.back()}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        &#x2715; {/* This is the "X" icon */}
                    </button>

                    <h2 className="text-3xl font-semibold mb-6 text-gray-800">
                        Register
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            <div className="w-full md:w-1/3">
                                <InputLabel htmlFor="firstname" value="First Name" className="mt-4" />
                                <TextInput
                                    id="firstname"
                                    name="firstname"
                                    value={data.firstname}
                                    style={{ backgroundColor: "white", color: "black" }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    onChange={handleChange}
                                    required
                                />
                                <InputError
                                    message={errors.firstname}
                                    className="text-red-500"
                                />
                            </div>
                            <div className="w-full md:w-2/3">
                                <InputLabel htmlFor="lastname" value="Last Name" className="mt-4" />
                                <TextInput
                                    id="lastname"
                                    name="lastname"
                                    value={data.lastname}
                                    style={{ backgroundColor: "white", color: "black" }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    onChange={handleChange}
                                    required
                                />
                                <InputError
                                    message={errors.lastname}
                                    className="text-red-500"
                                />
                            </div>
                        </div>
                        <InputLabel htmlFor="email" value="Email" className="mt-4" />
                        <TextInput
                            id="email"
                            type="text"
                            inputMode="email"
                            name="email"
                            value={data.email}
                            style={{ backgroundColor: "white", color: "black" }}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            onChange={handleChange}
                            required
                        />
                        <InputError
                            message={errors.email}
                            className="text-red-500"
                        />
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            <div className="w-full md:w-1/2">
                                <InputLabel htmlFor="password" value="Password" className="mt-4" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    style={{ backgroundColor: "white", color: "black" }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    autoComplete="new-password"
                                    onChange={handleChange}
                                    required
                                />
                                <InputError
                                    message={errors.password}
                                    className="text-red-500"
                                />
                            </div>

                            <div className="w-full md:w-1/2">
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="mt-4" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    style={{ backgroundColor: "white", color: "black" }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    autoComplete="new-password"
                                    onChange={(e) => setData("password_confirmation", e.target.value)}
                                    required
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="text-red-500"
                                />
                            </div>
                        </div>
                        <PrimaryButton
                            className="mt-4"
                            disabled={processing}
                        >
                            Register
                        </PrimaryButton>
                    </form>
                </div>

                {/* <div className="md:w-1/2 w-full flex justify-center items-center rounded-r-lg overflow-hidden h-64 md:h-auto">
                    <div
                        style={{
                            backgroundImage: `url(${loginImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            height: "100%",
                            width: "100%",
                        }}
                        className="w-full h-full rounded-r-lg"
                    />
                </div> */}
            </div>
        </GuestLayout>
    );
}
