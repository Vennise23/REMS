import React, { useRef } from 'react';
import { useForm, Link, Head, router } from '@inertiajs/react';

import Header from "@/Layouts/HeaderMenu";

export default function UploadImage({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        image: null,
    });

    const fileInput = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/three/upload');
    };

    return (
        <>
            <Head title="Main" />
            <Header auth={auth} />
            <main className="pt-32 mt-12 min-h-screen bg-gray-100 flex flex-col items-center">
                <h1 className="text-2xl font-bold mb-4">Upload Image</h1>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                            Select an Image:
                        </label>
                        <input
                            id="image"
                            type="file"
                            ref={fileInput}
                            accept="image/jpeg, image/png, image/gif, application/pdf"
                            onChange={(e) => setData('image', e.target.files[0])}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                        />
                        {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
                            disabled={processing}
                        >
                            {processing ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}
