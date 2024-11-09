import React from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        password_confirmation: '',
        ic_number: '',
        age: '',
        born_date: '',
        phone: '',
        profile_picture: null,
        address_line_1: '',
        address_line_2: '',
        city: '',
        postal_code: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={handleSubmit}>
                <InputLabel htmlFor="firstname" value="First Name" />
                <TextInput
                    id="firstname"
                    name="firstname"
                    value={data.firstname}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('firstname', e.target.value)}
                    required
                />
                <InputError message={errors.firstname} className="mt-2" />

                <InputLabel htmlFor="lastname" value="Last Name" className="mt-4" />
                <TextInput
                    id="lastname"
                    name="lastname"
                    value={data.lastname}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('lastname', e.target.value)}
                    required
                />
                <InputError message={errors.lastname} className="mt-2" />

                <InputLabel htmlFor="email" value="Email" className="mt-4" />
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('email', e.target.value)}
                    required
                />
                <InputError message={errors.email} className="mt-2" />

                <InputLabel htmlFor="password" value="Password" className="mt-4" />
                <TextInput
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    onChange={(e) => setData('password', e.target.value)}
                    required
                />
                <InputError message={errors.password} className="mt-2" />

                <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="mt-4" />
                <TextInput
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    required
                />
                <InputError message={errors.password_confirmation} className="mt-2" />

                <InputLabel htmlFor="ic_number" value="IC Number" className="mt-4" />
                <TextInput
                    id="ic_number"
                    name="ic_number"
                    value={data.ic_number}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('ic_number', e.target.value)}
                    required
                />
                <InputError message={errors.ic_number} className="mt-2" />

                <InputLabel htmlFor="age" value="Age" className="mt-4" />
                <TextInput
                    id="age"
                    type="number"
                    name="age"
                    value={data.age}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('age', e.target.value)}
                    required
                />
                <InputError message={errors.age} className="mt-2" />

                <InputLabel htmlFor="born_date" value="Born Date" className="mt-4" />
                <TextInput
                    id="born_date"
                    type="date"
                    name="born_date"
                    value={data.born_date}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('born_date', e.target.value)}
                    required
                />
                <InputError message={errors.born_date} className="mt-2" />

                <InputLabel htmlFor="phone" value="Phone" className="mt-4" />
                <TextInput
                    id="phone"
                    type="tel"
                    name="phone"
                    value={data.phone}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('phone', e.target.value)}
                    required
                />
                <InputError message={errors.phone} className="mt-2" />

                <InputLabel htmlFor="profile_picture" value="Profile Picture" className="mt-4" />
                <input
                    id="profile_picture"
                    type="file"
                    name="profile_picture"
                    className="mt-1 block w-full"
                    onChange={(e) => setData('profile_picture', e.target.files[0])}
                    required
                />
                <InputError message={errors.profile_picture} className="mt-2" />

                <InputLabel htmlFor="address_line_1" value="Address Line 1" className="mt-4" />
                <TextInput
                    id="address_line_1"
                    name="address_line_1"
                    value={data.address_line_1}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('address_line_1', e.target.value)}
                    required
                />
                <InputError message={errors.address_line_1} className="mt-2" />

                <InputLabel htmlFor="address_line_2" value="Address Line 2" className="mt-4" />
                <TextInput
                    id="address_line_2"
                    name="address_line_2"
                    value={data.address_line_2}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('address_line_2', e.target.value)}
                />
                <InputError message={errors.address_line_2} className="mt-2" />

                <InputLabel htmlFor="city" value="City" className="mt-4" />
                <TextInput
                    id="city"
                    name="city"
                    value={data.city}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('city', e.target.value)}
                    required
                />
                <InputError message={errors.city} className="mt-2" />

                <InputLabel htmlFor="postal_code" value="Postal Code" className="mt-4" />
                <TextInput
                    id="postal_code"
                    name="postal_code"
                    value={data.postal_code}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('postal_code', e.target.value)}
                    required
                />
                <InputError message={errors.postal_code} className="mt-2" />

                <PrimaryButton className="mt-4" disabled={processing}>
                    Register
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
