import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputSuccess from '@/Components/InputSuccess';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from "@/Components/InputLabel";
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { usePage } from "@inertiajs/react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing } = useForm({
        email: '',
    });
    const { errors = {} } = usePage().props;
    const { flash = {} } = usePage().props;
    const [successMessage, setSuccessMessage] = useState(flash?.message);
    const [errorMessage, setErrorMessage] = useState(errors?.message);
    const [gradientStyle, setGradientStyle] = useState({
        background: "linear-gradient(to top left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.5))",
        backgroundSize: "200% 200%",
        animation: "gradientShift 3s infinite alternate ease-in-out",
    });

    useEffect(() => {
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

    const [emailError, setEmailError] = useState('');

    // Email validation function using regex for international email formats
    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email) {
            setEmailError('Email is required');
            return false;
        }

        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }

        setEmailError('');
        return true;
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setSuccessMessage("");
        setErrorMessage("");
        setData('email', newEmail);
        validateEmail(newEmail);
    };

    const submit = (e) => {
        e.preventDefault();

        if (validateEmail(data.email)) {
            post(route('password.email'), {
                preserveScroll: true,
                onSuccess: (page) => {
                    setSuccessMessage(page.props.flash?.message || "Reset Link has been sent.");
                },
                onError: (error) => {
                    setSuccessMessage("");
                    setErrorMessage(error?.message);
                }
            });
        }
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />
            <div className="flex flex-col md:flex-row h-auto bg-transparent ">
                <div
                    className="w-full sm:w-auto min-w-[420px] min-h-fit max-w-md sm:max-w-lg mx-auto p-8 rounded-lg shadow-md flex flex-col justify-center relative overflow-hidden"
                    style={gradientStyle}
                >
                    {/* Close Button */}
                    <Link href={route('login')}>
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            &#x2715;{/* This is the "X" icon */}
                        </button>
                    </Link>
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Reset your password? No problem. Just let us know your email address and we will email you a password
                        reset link that will allow you to choose a new one.
                    </div>

                    {status && <div className="mb-4 font-medium text-sm text-green-600 dark:text-green-400">{status}</div>}

                    <form onSubmit={submit}>
                        <InputLabel
                            htmlFor="email"
                            value="Account Email:"
                            className="text-gray-800"
                        />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={handleEmailChange}
                        />

                        <InputError message={emailError || errorMessage} className="mt-2" />
                        <InputSuccess message={successMessage} />
                        <div className="flex items-center justify-end mt-4">
                            <PrimaryButton
                                disabled={processing || !!emailError}
                            >
                                Send Email
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
