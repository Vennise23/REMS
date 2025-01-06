import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

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
        setData('email', newEmail);
        validateEmail(newEmail);
    };

    const submit = (e) => {
        e.preventDefault();

        if (validateEmail(data.email)) {
            post(route('password.email'));
        }
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Reset your password? No problem. Just let us know your email address and we will email you a password
                reset link that will allow you to choose a new one.
            </div>

            {status && <div className="mb-4 font-medium text-sm text-green-600 dark:text-green-400">{status}</div>}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={handleEmailChange}
                />

                <InputError message={emailError || errors.email} className="mt-2" />

                <div className="flex items-center justify-end mt-4">
                    <PrimaryButton 
                        className="ms-4" 
                        disabled={processing || !!emailError}
                    >
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
