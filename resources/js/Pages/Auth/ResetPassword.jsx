import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InvalidToken from '@/Pages/Auth/InvalidToken';
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

export default function ResetPassword({ token }) {
    const [isTokenValid, setIsTokenValid] = useState(true);
    const [tokenMessage, setTokenMessage] = useState("");
    const [email,setEmail] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [gradientStyle, setGradientStyle] = useState({
        background: "linear-gradient(to top left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.5))",
        backgroundSize: "200% 200%",
        animation: "gradientShift 3s infinite alternate ease-in-out",
    });

    useEffect(() => {
        checkToken();

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

    const checkToken = async () => {
        try {
            // here the url is not directing to anywhere...
            const response = await axios.post('/validate-token', {
                token: token,
            });
            setIsTokenValid(!response.data.used);
            setTokenMessage(response.data.message);
            setEmail(response.data.email);
        } catch (error) {
            setIsTokenValid(false);

            if (error.response && error.response.data && error.response.data.message) {
                setTokenMessage(error.response.data.message);
            } else {
                setTokenMessage("An unexpected error occurred. ");
            }
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
                <InvalidToken message={tokenMessage} />
            ) : (
                <div className="flex flex-col md:flex-row h-auto bg-transparent ">
                <div
                    className="w-full sm:w-auto md:min-w-[350px] min-h-fit max-w-md sm:max-w-lg mx-auto p-8 rounded-lg shadow-md flex flex-col justify-center relative overflow-hidden"
                    style={gradientStyle}
                >
                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={email}
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
                </div>
                </div>
            )}
        </GuestLayout>
    );
}
