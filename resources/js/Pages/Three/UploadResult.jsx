import React, { useState, useEffect, useRef } from "react";
import { useForm, Link, Head, router } from "@inertiajs/react";

import Header from "@/Layouts/HeaderMenu";

export default function UploadResult({ originalImagePath, binarizedImagePath, originalThreShold, binarizedThreShold, auth }) {
    const [currentImage, setCurrentImage] = useState(binarizedImagePath);
    const [propertyID, setPropertyID] = useState('');
    const [threshold, setThreshold] = useState(binarizedThreShold);
    const [originalImageData, setOriginalImageData] = useState(null); // Store original image data
    const canvasRef = useRef(null);
    const [processing, setProcessing] = useState(false);

    // Load the image and prepare the canvas
    useEffect(() => {
        const img = new Image();
        img.src = originalImagePath;
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Save the original image data
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setOriginalImageData(imgData);
        };
    }, [originalImagePath]);

    // Extract propertyID from the URL query parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pid = urlParams.get('pid'); // Get 'pid' from the URL
        setPropertyID(pid || ''); // Fallback to an empty string if not found
    }, []);

    const applyBinarization = (threshold) => {
        if (!originalImageData) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Reset the canvas with the original image data
        ctx.putImageData(originalImageData, 0, 0);

        // Get a fresh copy of the image data
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Normalize threshold to a contrast factor (-1 to +1)
        const contrastFactor = threshold / 127;

        for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale using weighted formula
            const grayscale = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

            // Apply contrast adjustment
            const adjustedValue = Math.min(
                255,
                Math.max(0, 128 + (grayscale - 128) * (1 + contrastFactor))
            );

            // Set RGB channels to the adjusted grayscale value
            data[i] = data[i + 1] = data[i + 2] = adjustedValue;
        }

        // Update the canvas with the new image data
        ctx.putImageData(imgData, 0, 0);

        // Update the displayed image
        setCurrentImage(canvas.toDataURL());
    };

    const handleSliderChange = (e) => {
        const newThreshold = parseInt(e.target.value, 10);
        setThreshold(newThreshold);
        applyBinarization(newThreshold);
    };

    const handleImageClick = (imageType) => {
        if (imageType === "original") {
            setCurrentImage(originalImagePath);
            setThreshold(originalThreShold);
        } else if (imageType === "binarized") {
            setCurrentImage(binarizedImagePath);
            setThreshold(binarizedThreShold);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        post('/three/saveUpload');
    };

    return (
        <>
            <Head title="Main" />
            <Header auth={auth} />
            <main className="pt-32 mt-12 min-h-screen bg-gray-100 flex flex-col items-center">
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                <input type="hidden" id="propertyID" name="propertyID" value={propertyID}/>
                <input type="hidden" id="originalImagePath" name="originalImagePath" value={originalImagePath}/>
                <input type="hidden" id="binarizedImagePath" name="binarizedImagePath" value={binarizedImagePath}/>
                <input type="hidden" id="imagePath" name="imagePath" value={currentImage}/>
                    <div className="container my-5">
                        <div className="row">
                            {/* Showcase Image Section */}
                            <div className="col-md-9" id="imageShowcase">
                                <div className="img-showcase p-3 bg-white text-center">
                                    <img
                                        src={currentImage}
                                        alt="Showcase Image"
                                        className="rounded-lg shadow-md img-fluid w-100"
                                        style={{ maxHeight: "calc(100vh - 200px)", objectFit: "contain" }}
                                    />
                                    <canvas ref={canvasRef} style={{ display: "none" }} />
                                    <div className="text-center mt-3">
                                        <a href="/three/upload" className="btn btn-link">Upload another image</a>
                                    </div>
                                </div>
                            </div>

                            {/* Side Menu Section */}
                            <div className="col-md-3 d-flex flex-column justify-content-start align-items-stretch mt-3 mt-md-0" id="rightmenu">
                                <div className="side-menu bg-white p-3 d-flex flex-column">
                                    {/* Image Filter Selection */}
                                    <div className="d-flex flex-row flex-md-column justify-content-md-between">
                                        {/* Original Image */}
                                        <div className="mb-3 text-center">
                                            <img
                                                id="originalImageBtn"
                                                src={originalImagePath}
                                                alt="Original Image"
                                                className="img-fluid mb-2"
                                                onClick={() => handleImageClick("original")}
                                                style={{ maxWidth: "100%", height: "auto", margin: "auto" }}
                                            />
                                            <p className="small text-muted">Original Image</p>
                                        </div>

                                        {/* Binarized Image */}
                                        <div className="mb-3 text-center">
                                            <img
                                                id="binarizedImageBtn"
                                                src={binarizedImagePath}
                                                alt="Binarized Image"
                                                className="img-fluid mb-2"
                                                onClick={() => handleImageClick("binarized")}
                                                style={{ maxWidth: "100%", height: "auto", margin: "auto" }}
                                            />
                                            <p className="small text-muted">Auto Binarized Image</p>
                                        </div>
                                    </div>


                                    {/* Horizontal Line on Larger Screens */}
                                    <hr className="slider-separator d-none d-md-block" />

                                    {/* Binarization Threshold */}
                                    <div className="text-center mt-3">
                                        <label htmlFor="thresholdSlider" className="form-label">
                                            Binarization Threshold: <span id="thresholdValue">{threshold}</span>
                                        </label>
                                        <input
                                            type="range"
                                            id="threshold"
                                            min="0"
                                            max="255"
                                            step="1"
                                            value={threshold}
                                            onInput={handleSliderChange}
                                            className="mt-2 w-100"
                                        />
                                    </div>

                                    {/* Save Button */}
                                    <div className="d-flex justify-content-end mt-3">
                                        <button
                                        type="submit"
                                            className="btn btn-primary w-100"
                                            style={{ transition: "background-color 0.3s ease" }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = "green"}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = ""}
                                            disabled={processing}
                                        >
                                           {processing ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </>
    );
}
