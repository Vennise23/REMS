import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';
import loginImage from "/resources/img/hellohouse.gif";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const [customErrors, setCustomErrors] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Custom validation for email and password
        let emailError = '';
        let passwordError = '';

        if (!data.email.includes('@') || !data.email.endsWith('.com')) {
            emailError = 'The email format is incorrect. Please include "@" and ".com".';
        }

        if (data.password.length < 8) {
            passwordError = 'The password must be at least 8 characters long.';
        }

        if (emailError || passwordError) {
            setCustomErrors({ email: emailError, password: passwordError });
            return; // Stop form submission if there are errors
        }

        // If validation passes, clear custom errors and submit the form
        setCustomErrors({ email: '', password: '' });
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            <div className="flex flex-col md:flex-row h-auto bg-gray-100">
                 <div className="md:w-1/2 w-full flex flex-col justify-center p-8 max-w-md sm:max-w-lg mx-auto bg-white rounded-lg shadow-md relative">


                    {/* Close Button */}
                    <button
                        onClick={() => window.history.back()}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        &#x2715; {/* This is the "X" icon */}
                    </button>

                    <h2 className="text-3xl font-semibold mb-6 text-gray-800">Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputLabel htmlFor="email" value="Email" className="text-gray-800" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            style={{ backgroundColor: 'white', color: 'black' }}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email || customErrors.email} className="text-red-500" />

                        <InputLabel htmlFor="password" value="Password" className="text-gray-800 mt-4" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            style={{ backgroundColor: 'white', color: 'black' }}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password || customErrors.password} className="text-red-500" />

                        <div className="flex items-center justify-end mt-4">
                            <PrimaryButton className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" disabled={processing}>
                                Login
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                <div className="md:w-1/2 w-full flex justify-center items-center rounded-r-lg overflow-hidden h-64 md:h-auto">
                    <div
                        style={{
                            backgroundImage: `url(${loginImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            height: '100%',
                            width: '100%',
                        }}
                        className="w-full h-full rounded-r-lg"
                    />
                </div>
            </div>
        </GuestLayout>
    );
}
