import React from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';
import loginImage from "/resources/img/hellohouse.gif";

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="flex flex-col md:flex-row h-auto bg-gray-100">
                <div className="md:w-1/2 w-full flex flex-col justify-center p-8 max-w-md sm:max-w-lg mx-auto bg-white rounded-lg shadow-md">
                    <h2 className="text-3xl font-semibold mb-6 text-gray-800">Register</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputLabel htmlFor="firstname" value="First Name" />
                        <TextInput
                            id="firstname"
                            name="firstname"
                            value={data.firstname}
                            style={{ backgroundColor: 'white', color: 'black' }}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            onChange={(e) => setData('firstname', e.target.value)}
                            required
                        />
                        <InputError message={errors.firstname} className="text-red-500" />

                        <InputLabel htmlFor="lastname" value="Last Name" className="mt-4" />
                        <TextInput
                            id="lastname"
                            name="lastname"
                            value={data.lastname}
                            style={{ backgroundColor: 'white', color: 'black' }}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            onChange={(e) => setData('lastname', e.target.value)}
                            required
                        />
                        <InputError message={errors.lastname} className="text-red-500" />

                        <InputLabel htmlFor="email" value="Email" className="mt-4" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            style={{ backgroundColor: 'white', color: 'black' }}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="text-red-500" />

                        <InputLabel htmlFor="password" value="Password" className="mt-4" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            style={{ backgroundColor: 'white', color: 'black' }}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="text-red-500" />

                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="mt-4" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            style={{ backgroundColor: 'white', color: 'black' }}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <InputError message={errors.password_confirmation} className="text-red-500" />

                        <PrimaryButton className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" disabled={processing}>
                            Register
                        </PrimaryButton>
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
