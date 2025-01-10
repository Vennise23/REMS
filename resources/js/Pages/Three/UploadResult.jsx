import React, { useRef, useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import Header from "@/Layouts/HeaderMenu";
import Tesseract, { detect } from "tesseract.js";

export default function Binarize({ bImages, auth }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentThreshold, setCurrentThreshold] = useState(127);
    const [currentShowcaseImage, setCurrentShowcaseImage] = useState("");
    const [binarizedImageButton, setBinarizedImageButton] = useState("");
    const [loading, setLoading] = useState(true);
    const [detectedText, setDetectedText] = useState("");
    const [textLoading, setTextLoading] = useState(true);
    const [drawing, setDrawing] = useState(false); // To track if user is drawing
    const [rect, setRect] = useState(null); // Store rectangle position and size
    const canvasRef = useRef(null);

    useEffect(() => {
        if (bImages[currentIndex]) {
            loadAndProcessImage(bImages[currentIndex].filepath, currentThreshold);
            updateSliderValueStyle(currentThreshold);
            detectText();
        }
        setTimeout(() => setLoading(false), 1000);
    }, [currentIndex]);    

    useEffect(() => {
        if (drawing && currentShowcaseImage) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            const image = new Image();
            image.src = currentShowcaseImage;

            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear any previous drawings
                ctx.drawImage(image, 0, 0); // Draw the current image onto the canvas
            };
        }
    }, [drawing, currentShowcaseImage]);

    const loadAndProcessImage = (filepath, threshold) => {
        const image = new Image();
        image.src = filepath;
        image.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            applyBinarization(threshold);

            // Generate binarized button image with default threshold
            const binarizedImage = generateBinarizedImage(127);
            setBinarizedImageButton(binarizedImage);
        };
    };

    const applyBinarization = (threshold) => {
        const binarizedImage = generateBinarizedImage(threshold);
        setCurrentShowcaseImage(binarizedImage);
    };

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
        detectText();
    };

    const handleBinarizedClick = () => {
        setCurrentThreshold(127);
        applyBinarization(127);
        updateSliderValueStyle(127);
        detectText();
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
        // Trigger text detection for the new image
        detectText();
    };

    const handleNext = () => {
        setLoading(true);
        const newIndex = currentIndex + 1;
        if (currentIndex < bImages.length - 1) setCurrentIndex(newIndex);
        setCurrentThreshold(bImages[newIndex].threshold);
        applyBinarization(bImages[newIndex].threshold);
        updateSliderValueStyle(bImages[newIndex].threshold);
        // Trigger text detection for the new image
        detectText();
    };

    const detectText = (rect = null, isSliderChange = false) => {
        setTextLoading(true);
        setLoading(true);
    
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error("Canvas not found.");
            setLoading(false);
            setTextLoading(false);
            return;
        }
    
        const ctx = canvas.getContext("2d");
        const originalImage = new Image();
        originalImage.src = canvas.toDataURL();
    
        originalImage.onload = () => {
            // If bImages['texts'] is already populated, this is not the first time detection
            // if (!bImages['texts'] || isSliderChange) {
                // Perform first-time detection of the entire image or when slider changes
                canvas.width = originalImage.width;
                canvas.height = originalImage.height;
                ctx.drawImage(originalImage, 0, 0);
    
                Tesseract.recognize(originalImage.src, "eng", {
                    logger: (info) => console.log(info),
                    tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", // Alphanumeric whitelist
                })
                    .then(({ data }) => {
                        const detectedText = [];
                        data.words.forEach((word) => {
                            if (word.confidence > 80) {
                                const wordData = {
                                    text: word.text,
                                    bbox: word.bbox,
                                };
                                detectedText.push(wordData);
    
                                // Draw bounding boxes for detected words
                                ctx.strokeStyle = "red";
                                ctx.lineWidth = 2;
                                const { x0, y0, x1, y1 } = word.bbox;
                                ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
                            }
                        });
    
                        // Store detected text and their bounding boxes in bImages['texts']
                        bImages['texts'] = detectedText;
    
                        // Set the detected text to be shown
                        setDetectedText(detectedText.map((item) => item.text).join(" "));
    
                        // Update currentShowcaseImage with the detected text and bounding boxes
                        setCurrentShowcaseImage(canvas.toDataURL());
                    })
                    .catch((error) => {
                        console.error("Error detecting text:", error);
                    })
                    .finally(() => {
                        setLoading(false);
                        setTextLoading(false);
                    });
            // } else {
            //     // If bImages['texts'] already exists, detect text inside the given rectangle
            //     if (rect) {
            //         const rectTexts = [];
            //         bImages['texts'].forEach((wordData) => {
            //             const { bbox, text } = wordData;
    
            //             // Check if the word's bounding box intersects with the rectangle
            //             const isIntersecting =
            //                 bbox.x0 < rect.startX + rect.width &&
            //                 bbox.x1 > rect.startX &&
            //                 bbox.y0 < rect.startY + rect.height &&
            //                 bbox.y1 > rect.startY;
    
            //             if (isIntersecting) {
            //                 rectTexts.push({ text, bbox });
            //             }
            //         });
    
            //         setDetectedText(rectTexts.map((item) => item.text).join(" "));
    
            //         // Highlight the bounding boxes for the intersecting words
            //         ctx.strokeStyle = "red";
            //         ctx.lineWidth = 2;
            //         rectTexts.forEach((item) => {
            //             const { x0, y0, x1, y1 } = item.bbox;
            //             ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
            //         });
    
            //         // Update currentShowcaseImage with the highlighted rectangles
            //         setCurrentShowcaseImage(canvas.toDataURL());
            //     } else {
            //         console.error("Rectangle is required for subsequent detections.");
            //         setLoading(false);
            //         setTextLoading(false);
            //     }
            // }
        };
    
        originalImage.onerror = () => {
            console.error("Failed to load image for text detection.");
            setLoading(false);
            setTextLoading(false);
        };
    };
    
    

    // Function to handle mouse click event on the canvas
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const canvasRect = canvas.getBoundingClientRect();
        const clickX = e.clientX - canvasRect.left;
        const clickY = e.clientY - canvasRect.top;

        // Check if the click is inside any of the red bounding boxes
        const clickedBox = bImages['texts'].find((wordData, index) => {
            const { x0, y0, x1, y1 } = wordData.bbox;

            return (
                clickX >= x0 &&
                clickX <= x1 &&
                clickY >= y0 &&
                clickY <= y1
            );
        });

        if (clickedBox) {
            // If a box was clicked, find its index in the array and remove it
            const clickedIndex = bImages['texts'].indexOf(clickedBox);

            // Remove the text and bounding box from the list
            bImages['texts'].splice(clickedIndex, 1);

            // Redraw the image with the updated bounding boxes
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const image = new Image();
            image.src = canvas.toDataURL();

            image.onload = () => {
                ctx.drawImage(image, 0, 0);

                // Redraw the remaining bounding boxes
                bImages['texts'].forEach((wordData) => {
                    const { bbox } = wordData;
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 2;
                    const { x0, y0, x1, y1 } = bbox;
                    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
                });

                // Update the displayed image after removing the box
                setCurrentShowcaseImage(canvas.toDataURL());
            };
        }

        setTextLoading(false);
    };

    // Attach the click event handler to the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener("click", handleCanvasClick);
        }
        return () => {
            if (canvas) {
                canvas.removeEventListener("click", handleCanvasClick);
            }
        };
    }, []);


    // Toggle drawing mode
    const handleDrawButtonClick = () => {
        setDrawing((prev) => !prev);

        if (!drawing) {
            // Switch to drawing mode: redraw the image on the canvas
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            const image = new Image();
            image.src = currentShowcaseImage;

            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0);
            };
        }
    };


    // Start drawing the rectangle
    const handleMouseDown = (e) => {
        if (!drawing) return;

        const canvas = canvasRef.current;
        const rectStartX = e.clientX - canvas.getBoundingClientRect().left;
        const rectStartY = e.clientY - canvas.getBoundingClientRect().top;

        setRect({ startX: rectStartX, startY: rectStartY, width: 0, height: 0 });
    };

    // Update rectangle dimensions as mouse moves
    const handleMouseMove = (e) => {
        if (!rect || !drawing) return;

        const canvas = canvasRef.current;
        const rectWidth = e.clientX - canvas.getBoundingClientRect().left - rect.startX;
        const rectHeight = e.clientY - canvas.getBoundingClientRect().top - rect.startY;

        setRect({
            ...rect,
            width: rectWidth,
            height: rectHeight,
        });
    };

    const handleMouseUp = () => {
        if (drawing && rect.width && rect.height) {
            //detectText(rect);
            setDrawing(false); // Exit drawing mode after text detection
        }
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
                                <div className="d-flex justify-content-between mb-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleDrawButtonClick}
                                    >
                                        {drawing ? "Stop Drawing" : "Draw Rectangle"}
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
                                            {drawing ? (
                                                <canvas
                                                    ref={canvasRef}
                                                    onMouseDown={handleMouseDown}
                                                    onMouseMove={handleMouseMove}
                                                    onMouseUp={handleMouseUp}
                                                    style={{
                                                        display: "block",
                                                        width: "100%",
                                                        maxHeight: "calc(100vh - 250px)",
                                                    }}
                                                />
                                            ) : currentShowcaseImage ? (
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
                                                            disabled={drawing} // Disable slider in drawing mode
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
                                            {detectedText || textLoading ? (
                                                <div className="mt-3">
                                                    <h5>Detected Text:</h5>
                                                    {textLoading ? (
                                                        <div className="d-flex justify-content-center align-items-center">
                                                            <div className="spinner-border text-primary" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                            {detectedText}
                                                        </pre>
                                                    )}
                                                </div>
                                            ) : null}

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
