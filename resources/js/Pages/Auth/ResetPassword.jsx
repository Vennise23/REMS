import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/dist/sweetalert2.css';
import axios from 'axios';

axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').content;

export default function ResetPassword({ token, email }) {
    const [isTokenValid, setIsTokenValid] = useState(true);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        checkToken();
    }, []);

    const checkToken = async () => {
        try {
            const response = await axios.post('/validate-token', {
                token: token,
                email: email
            });
            setIsTokenValid(!response.data.used);
        } catch (error) {
            setIsTokenValid(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();

        try {
            // Add validation before submitting
            if (!data.password || !data.password_confirmation) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Please fill in all password fields',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (data.password.length < 8) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Password must be at least 8 characters long',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (data.password !== data.password_confirmation) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Passwords do not match',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }

            const response = await axios.post('/setup-password', {
                token: data.token,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation
            });

            await Swal.fire({
                title: 'Success!',
                text: 'Your password has been updated successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            window.location.href = route('login');
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Something went wrong.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    return (
        <GuestLayout>
            <Head title={isTokenValid ? "Reset Password" : "Invalid Token"} />

            {!isTokenValid ? (
                <div className="mb-4 text-sm text-gray-600 text-center">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-red-600">
                            Invalid Token
                        </h2>
                        <p className="mt-4">
                            This password reset link has already been used or is invalid.
                        </p>
                    </div>

                    <div className="mt-4 flex items-center justify-center">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Return to Login
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            disabled
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                        <TextInput
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <PrimaryButton className="ml-4" disabled={processing}>
                            Reset Password
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </GuestLayout>
    );
}
