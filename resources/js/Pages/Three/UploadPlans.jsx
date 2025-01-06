import React, { useRef, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import axios from "axios";
import { Modal, Button } from 'react-bootstrap';
import $ from "jquery";
import { useForm, Link, Head, router } from '@inertiajs/react';

import Header from "@/Layouts/HeaderMenu";

export default function UploadImage({ bImages, auth }) {
    //Set initial value
    const { data, setData, post, processing, errors } = useForm({
        image: null,
    });
    const [files, setFiles] = useState([]);
    const [show, setShow] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    //Handle file drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = e.dataTransfer.files;
        validateAndUploadFile(droppedFiles);
    };

    // Handle file selection from file input
    const handleFileSelect = (event) => {
        const selectedFiles = event.target.files;
        validateAndUploadFile(selectedFiles);
    };

    //Validate the image and upload to server.
    const validateAndUploadFile = (fileList) => {
        const newFiles = [];
        const maxFileSize = 2 * 1024 * 1024; // 2MB
        Array.from(fileList).forEach((file) => {
            var filename = file.name;
            if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
                alert(filename + ' is not a valid image file.');
            } else if (file.size > maxFileSize) {
                alert(filename + ' exceeds the 2MB size limit.');
            } else {
                newFiles.push(file);
                uploadFile(file);
            }
        })
    }

    //Upload file to serber temp folder
    const uploadFile = (file) => {
        const formData = new FormData();
        formData.append("file", file);

        $.ajax({
            url: "/three/uploadFile",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            dataType: "json",
            success: function (response) {
                console.log("File uploaded successfully:", response);
                let newFiles = {
                    name: response.fileName,
                    filePath: response.filePath,
                }
                setFiles((prevFiles) => [...prevFiles, newFiles]);
            },
            error: function (xhr) {
                console.error("Error uploading file:", xhr.responseJSON);
                alert(xhr.responseJSON?.message || "File upload failed.");
            }

        })
    }

    const deleteFile = (filePath, fileName) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
        //file in temp file will automatically delete in 2 hours.
    }

    const handleClose = () => setShow(false);

    const handleShow = (file) => {
        console.log("File to be shown:", file);
        setSelectedFile(file);
        setShow(true);
    };

    const getFileUrl = (file) => {
        if (file?.filePath) {
            return file.filePath; // If the file has a URL from the server, use it.
        }
        return "";
    };

     // Rearranging Files with Drag and Drop
     const onDragStart = (index) => (e) => {
        e.dataTransfer.setData("dragIndex", index);
    };

    const onDragOverItem = (index) => (e) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData("dragIndex"), 10);
    
        if (dragIndex !== index && dragIndex >= 0 && dragIndex < files.length) {
            const reorderedFiles = [...files];
            const draggedItem = reorderedFiles[dragIndex];
    
            if (draggedItem) {
                reorderedFiles.splice(dragIndex, 1); // Remove the dragged item
                reorderedFiles.splice(index, 0, draggedItem); // Insert it at the new position
    
                setFiles(reorderedFiles);
                e.dataTransfer.setData("dragIndex", index); // Update the dragIndex
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const newArray = [];
        files.forEach((file) => {
            if (file.name && file.filePath) {
                newArray.push({
                    filename: file.name,
                    filepath: file.filePath,
                    threshold: 127,
                });
            }
        });
    
        bImages.forEach((file) => {
            if (file.filename && file.filepath) {
                newArray.push({
                    filename: file.filename,
                    filepath: file.filepath,
                    threshold: file.threshold,
                });
            }
        });
    
        const data = { images: newArray };
    
        try {
            const response = await axios.post('/three/submitUpload', data, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });
    
            if (response.data.redirect) {
                window.location.href = response.data.redirect;
            } else {
                console.log('Response:', response.data);
            }
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
        }
    };
    


    return (
        <>
            <Head title="Main" />
            <Header auth={auth} />
            <main className="pt-32 mt-12 min-h-screen bg-gray-100 flex flex-col items-center">
                <h1 style={{ fontSize: "2.5em" }}>Upload Image</h1>
                <h5 className="text-muted">Accept (jpeg, png, jpg) file only</h5>
                <div className="row mt-3 col-12 col-md-10 col-lg-10 d-flex justify-content-center">
                    {/* Left side */}
                    <div className="col-md-8 m-3 bg-white p-3 shadow-sm rounded">
                        <div
                            className="border-dashed border-3 p-3 text-center d-flex align-items-center justify-content-center"
                            style={{ minHeight: "400px", cursor: "pointer" }}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("image").click()}
                        >
                            <p>Drag files here or click to upload</p>
                            <input
                                type="file"
                                id="image"
                                name="upload_file"
                                accept=".jpeg, .jpg, .png"
                                multiple
                                style={{ display: "none" }}
                                onChange={handleFileSelect}
                            />
                        </div>
                    </div>
                    {/* Right side */}
                    <div className="col-md-3 m-3 bg-white p-3 shadow-sm rounded"
                        style={{ maxHeight: "60vh", overflow: "auto" }}
                    >
                        <div id="file-list">
                            {files.length > 0 ? (
                                files.map((file, index) => (
                                    <div
                                key={index}
                                draggable
                                onDragStart={onDragStart(index)}
                                onDragOver={onDragOverItem(index)}
                                className="d-flex align-items-center mb-2 cursor-pointer"
                            >
                                        <img
                                            src={file.filePath || URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="img-thumbnail me-2"
                                            style={{ width: "50px", height: "50px" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShow(file);
                                            }}
                                        />
                                        <span
                                            className="flex-grow-1 text-truncate"
                                            style={{ maxWidth: "calc(100% - 60px)" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShow(file);
                                            }}
                                        >
                                            {file.name}
                                        </span>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteFile(file.filePath, file.name)}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))
                            ) : bImages.length > 0 ? (
                                // Else if `bImages` array has items
                                bImages.map((bImage, index) => (
                                    <div className="d-flex align-items-center mb-2 max-w-100" key={index}>
                                        <img
                                            src={bImage.filePath || URL.createObjectURL(bImage.file)}
                                            alt={`Image ${index}`}
                                            className="img-thumbnail me-2"
                                            style={{ width: "50px", height: "50px" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShow(bImage.file);
                                            }}
                                        />
                                        <span
                                            className="flex-grow-1 text-truncate"
                                            style={{ maxWidth: "calc(100% - 60px)" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShow(bImage.file);
                                            }}
                                        >
                                            {bImages.file.name}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                //Else if there is no file
                                <div className="d-flex row justify-content-center h-100 align-items-center text-center max-w-100 position-relative">
                                    <p className="mb-2">No file uploaded yet</p>
                                    <img
                                        src="/storage/uploads/source_img/no_file.png"
                                        alt="No file found"
                                        className="img-fluid mx-auto d-block"
                                        style={{ bottom: "10px", width: "100px" }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Full-width div with button to submit */}
                    <div className="row col-12 mt-4 d-flex justify-content-center">
                        <div className="col-md-4 cursor-pointer">
                            <button
                                onClick={handleSubmit}
                                className="btn btn-primary w-100 cursor-pointer"
                                disabled={processing || files.length === 0}
                            >
                                Submit to Binarize
                            </button>
                        </div>
                    </div>
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />

                    {/* Modals for image preview */}
                    <Modal show={show} onHide={handleClose} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Image Preview</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="modal-body text-center">
                                <img
                                    src={getFileUrl(selectedFile)}
                                    alt="Preview"
                                    className="img-fluid"
                                />
                            </div>
                            <h5 className="mt-2">{selectedFile?.name}</h5>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </main >
        </>
    );
}
