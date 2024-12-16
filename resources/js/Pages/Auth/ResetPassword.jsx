import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').content;

export default function ResetPassword({ token, email }) {
    const [tokenValid, setTokenValid] = useState(true);
    const [tokenExpired, setTokenExpired] = useState(false);
    const [tokenUsed, setTokenUsed] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(true);
    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const validatePassword = (password) => {
        const minLength = 8;
        
        return {
            isValid: password.length >= minLength,
            message: password.length >= minLength ?
                '' : 'Password must be at least 8 characters'
        };
    };

    const validateToken = async (token) => {
        try {
            const response = await axios.post('/api/validate-reset-token', {
                token: token,
                email: data.email
            });
            return response.data;
        } catch (error) {
            console.error('Token validation error:', error);
            throw error;
        }
    };

    useEffect(() => {
        const validateResetToken = async () => {
            try {
                if (!token) {
                    setIsTokenValid(false);
                    setError('No token provided');
                    return;
                }
                
                const result = await validateToken(token);
                if (result.valid) {
                    setIsTokenValid(true);
                } else {
                    setIsTokenValid(false);
                    setError(result.message);
                }
            } catch (error) {
                setIsTokenValid(false);
                setError(error.response?.data?.message || 'Error validating token');
            }
        };

        if (token) {
            validateResetToken();
        }
    }, [token]);

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return false;
        }
        
        setConfirmPasswordError('');
        return true;
    };

    const submit = async (e) => {
        e.preventDefault();

        // Password validation
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.isValid) {
            setData('errors', {
                ...errors,
                password: passwordValidation.message
            });
            return;
        }

        // Confirm Password validation
        if (!validateConfirmPassword(data.password, data.password_confirmation)) {
            return;
        }

        try {
            const response = await axios.post('/api/reset-password', {
                token: data.token,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation
            });

            if (response.data.success) {
                // Redirect directly to login page
                window.location.href = route('login');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            setError(error.response.data.message || 'An error occurred');
        } else if (error.request) {
            // The request was made but no response was received
            setError('No response received from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            setError('Error setting up the request');
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setData('password', newPassword);
        
        // Real-time validation
        const validation = validatePassword(newPassword);
        setPasswordError(validation.message);
    };

    const handleConfirmPasswordChange = (e) => {
        const confirmPassword = e.target.value;
        setData('password_confirmation', confirmPassword);
        validateConfirmPassword(data.password, confirmPassword);
    };

    if (!isTokenValid) {
        return (
            <GuestLayout>
                <Head title="Invalid Token" />
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600">
                        {tokenExpired ? "Token has expired" : 
                         tokenUsed ? "Token has already been used" : 
                         "Invalid token"}
                    </h2>
                    <p className="mt-4">
                        Please request a new password reset link.
                    </p>
                    <Link 
                        href={route('password.request')} 
                        className="text-red-600 hover:text-red-800 underline"
                    >
                        Request New Reset Link
                    </Link>
                </div>
            </GuestLayout>
        );
    }

    if (resetSuccess) {
        return (
            <GuestLayout>
                <Head title="Password Reset Successful" />
                <div className="text-center">
                    <h2 className="text-xl font-bold text-green-600">
                        Password Reset Successful
                    </h2>
                    <p className="mt-4">
                        Redirecting to login page...
                    </p>
                </div>
            </GuestLayout>
        );
    }

    // Original form JSX remains the same
    return (
        <GuestLayout>
            <Head title="Reset Password" />

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
                        onChange={handlePasswordChange}
                    />

                    {passwordError && <InputError message={passwordError} className="mt-2" />}
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />

                    <TextInput
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={handleConfirmPasswordChange}
                    />

                    <InputError message={confirmPasswordError || errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Reset Password
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
