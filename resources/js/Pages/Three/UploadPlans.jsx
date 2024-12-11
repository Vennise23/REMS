import React, { useRef,useState } from 'react';
import axios from "axios";
import { useForm, Link, Head, router } from '@inertiajs/react';

import Header from "@/Components/HeaderMenu";

export default function UploadImage({ auth }) {
    //Set initial value
    const { data, setData, post, processing, errors } = useForm({
        image: null,
    });

    //Handle file drag and drop
    const fileDragOver = (e) => {
        e.preventDefault();
    };

    const fileDrop = (e) => {
        e.preventDefault();
        const droppedFiles = e.dataTransfer.files;
        validateAndUploadFile(droppedFiles);
    };

    //Validate the image and upload to server.
    const validateAndUploadFile= (fileList) =>{
        const newFiles = [];
        const maxFileSize = 2 * 1024 * 1024; // 2MB
        Array.from(fileList).forEach((file)=>{
            var filename =  file.name;
            if(!["image/jpeg","image/png","image/jpg"].includes(file.type)){
                alert( filename+' is not a valid image file.');
            }else if (file.size > maxFileSize){
                alert(filename+' exceeds the 2MB size limit.');
            }else{
                newFiles.push(file);
                uploadFile(file);
            }
        })
    }

    //Upload file to serber temp folder
    const uploadFile=(file)=>{
        const formData = new FormData();
        fromData.append("file",file);

        $.ajax({
            url:"/three/uploadFile",
            type:"POST",
            data: formData,
            processData: false,
            contentType: false,
            dataType:"json",
            success: function(response){
                console.log("File uploaded successfully:", response);
            },
            error: function (xhr){
                console.error("Error uploading file:", xhr.responseJSON);
                alert(xhr.responseJSON?.message || "File upload failed.");
            }

        })
    }

    // const fileInput = useRef();

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     post('/three/upload');
    // };

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
                            accept="image/jpeg, image/png, image/gif"
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
