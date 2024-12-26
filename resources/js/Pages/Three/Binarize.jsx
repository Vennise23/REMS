import React, { useRef, useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import Header from "@/Components/HeaderMenu";

export default function Binarize({ bImages, auth }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentThreshold, setCurrentThreshold] = useState(127);
    const [currentShowcaseImage, setCurrentShowcaseImage] = useState("");
    const [binarizedImageButton, setBinarizedImageButton] = useState("");
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (bImages[currentIndex]) {
            const image = new Image();
            image.src = bImages[currentIndex].filepath;

            image.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });

                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                applyBinarization(currentThreshold);
                //setCurrentShowcaseImage(canvas.toDataURL());

                // Generate binarized button image with default threshold
                const binarizedImage = generateBinarizedImage(127);
                setBinarizedImageButton(binarizedImage);
            };
            
            updateSliderValueStyle(currentThreshold);
        }
        setTimeout(()=>setLoading(false),1000);
    }, [currentIndex, bImages]);

    const generateBinarizedImage = (threshold) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Reset the canvas with the original image data
        const image = new Image();
        image.src = bImages[currentIndex].filepath;
        ctx.drawImage(image, 0, 0);

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
        return canvas.toDataURL(); // Return binarized image
    };

    const applyBinarization = (threshold) => {
        const binarizedImage = generateBinarizedImage(threshold);
        setCurrentShowcaseImage(binarizedImage);
    };

    const handleOriginalClick = () => {
        setCurrentThreshold(0);
        const img = new Image();
        img.src = bImages[currentIndex].filepath;

        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            setCurrentShowcaseImage(canvas.toDataURL()); // Set original image
        };
        updateSliderValueStyle(0);
    };

    const handleBinarizedClick = () => {
        setCurrentThreshold(127);
        applyBinarization(127);
        updateSliderValueStyle(127);
    };

    const handleSliderChange = (e) => {
        const newThreshold = parseInt(e.target.value, 10);
        setCurrentThreshold(newThreshold);
        if (newThreshold == 0) {
            setCurrentShowcaseImage(bImages[currentIndex].filepath);
        } else {
            applyBinarization(newThreshold);
        }

        updateSliderValueStyle(newThreshold);
        bImages[currentIndex].threshold = newThreshold;
    };

    const updateSliderValueStyle = (value, retry = true) => {
        const min = 0;
        const max = 255;
        const percentage = ((value - min) / (max - min)) * 100;
    
        // Set the custom CSS variable --value
        const slider = document.getElementById("threshold");
        if (slider) {
            // Set the custom CSS variable --value
            slider.style.setProperty("--value", `${percentage}%`);
        } else if (retry) {
            console.warn("Slider element not found. Retrying in 1.5 seconds...");
            setTimeout(() => updateSliderValueStyle(value, false), 1500);
        } else {
            console.error("Slider element not found after retry.");
        }
    };

    const handlePrev = () => {
        setLoading(true);
        const newIndex = currentIndex - 1;
        if (currentIndex > 0) setCurrentIndex(newIndex);
        setCurrentThreshold(bImages[newIndex].threshold);
        applyBinarization(bImages[newIndex].threshold);
        updateSliderValueStyle(bImages[newIndex].threshold);
        setTimeout(()=>setLoading(false),1000);
    };

    const handleNext = () => {
        setLoading(true);
        const newIndex = currentIndex + 1;
        if (currentIndex < bImages.length - 1) setCurrentIndex(newIndex);
        setCurrentThreshold(bImages[newIndex].threshold);
        applyBinarization(bImages[newIndex].threshold);
        updateSliderValueStyle(bImages[newIndex].threshold);
        setTimeout(()=>setLoading(false),1000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting image data:", {
            ...bImages[currentIndex],
            threshold: currentThreshold,
        });
    };

    return (
        <>
            <Head title="Binarize" />
            <Header auth={auth} />
            <main className="pt-32 mt-12 min-h-screen bg-gray-100 flex flex-col items-center">
                <h1 style={{ fontSize: "2.5em" }}>Binarization</h1>
                <div className="container-fluid">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 mx-auto row justify-content-center"
                        style={{ maxWidth: "100%" }}
                    >
                        <div className="col-lg-8 col-md-10 col-12">
                            <div className="my-5">
                                <div className="d-flex justify-content-between mb-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                    >
                                        &lt; Prev
                                    </button>
                                    <h5 className="mt-2">
                                        {bImages[currentIndex]?.filename || "No File"}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleNext}
                                        disabled={currentIndex === bImages.length - 1}
                                    >
                                        Next &gt;
                                    </button>
                                </div>

                                <div className="row">
                                    {/* Showcase Image Section */}
                                    <div className="col-md-9">
                                        <div className="img-showcase p-3 bg-white text-center">
                                        {loading && (
                                                <div className="overlay d-flex justify-content-center align-items-center">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                            )}
                                            {currentShowcaseImage ? (
                                                <>
                                                    <img
                                                        src={currentShowcaseImage}
                                                        alt="Showcase"
                                                        className="rounded-lg shadow-md img-fluid w-100"
                                                        style={{
                                                            maxHeight: "calc(100vh - 250px)",
                                                            objectFit: "contain",
                                                        }}
                                                    />
                                                    <div className="mt-3">
                                                        <label htmlFor="thresholdSlider" className="form-label">
                                                            Threshold: {currentThreshold}
                                                        </label>
                                                        <input
                                                            type="range"
                                                            id="threshold"
                                                            min="0"
                                                            max="255"
                                                            step="1"
                                                            value={currentThreshold}
                                                            onInput={handleSliderChange}
                                                            className="form-range w-100"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <p>No image available</p>
                                            )}
                                            <canvas ref={canvasRef} style={{ display: "none" }} />
                                        </div>
                                    </div>

                                    {/* Side Menu Section */}
                                    <div className="col-md-3">
                                        <div className="side-menu bg-white p-3">
                                            {/* Original Image Button */}
                                            <div className="mb-3 text-center">
                                                <img
                                                    src={bImages[currentIndex]?.filepath}
                                                    alt="Original"
                                                    className="img-fluid mb-2"
                                                    onClick={handleOriginalClick}
                                                    style={{
                                                        width: "100%",
                                                        height: "auto",
                                                        objectFit: "contain",
                                                        cursor: "pointer",
                                                        maxHeight: "200px",
                                                    }}
                                                />
                                                <p className="small text-muted">Original Image</p>
                                            </div>

                                            {/* Binarized Image Button */}
                                            <div className="mb-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={handleBinarizedClick}
                                                    className="img-fluid mb-2"
                                                >
                                                    <img
                                                        src={binarizedImageButton}
                                                        alt="Binarized"
                                                        className="img-fluid"
                                                        style={{
                                                            width: "100%",
                                                            height: "auto",
                                                            objectFit: "contain",
                                                            cursor: "pointer",
                                                            maxHeight: "200px",
                                                        }}
                                                    />
                                                </button>
                                                <p className="small text-muted">Auto Binarized Image</p>
                                            </div>

                                            {/* <button
                                                type="submit"
                                                className="btn btn-primary w-100 mt-3"
                                            >
                                                Save
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
