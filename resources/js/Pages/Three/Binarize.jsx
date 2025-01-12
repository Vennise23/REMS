import React, { useRef, useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import Header from "@/Layouts/HeaderMenu";
import Tesseract, { detect } from "tesseract.js";
import { canvas } from "leaflet";

export default function Binarize({ bImages, auth }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentThreshold, setCurrentThreshold] = useState(0);
    const [canvasLoadingStage, setCanvasLoadingStage] = useState(false);

    const [currentImg, setCurrentImg] = useState("");
    const [autoBinarizeImage, setAutoBinarizeImage] = useState(""); // Auto Binarize Btn Img
    const [textDetectImage, setTextDetectImage] = useState(""); // Auto Text Detect Btn Img

    const canvasRef = useRef(null); // Hidden canvas for processing
    const canvasMain = useRef(null); // Visible canvas for displaying
    const canvasText = useRef(null); // Visible canvas for text detection

    useEffect(() => {
        const initializeCanvas = async () => {
            if (bImages[currentIndex]) {
                // Initialize Threshold
                setCurrentThreshold(bImages[currentIndex].threshold);
                updateSliderStyle(bImages[currentIndex].threshold);

                // Initialize Canvas
                const currImg = await loadAndBinarizeImage(bImages[currentIndex].filepath, bImages[currentIndex].threshold);
                if (bImages[currentIndex].textDetectImg) {
                    setTextDetectImage(bImages[currentIndex].textDetectImg);
                    const textCanvas = canvasText.current;
                    const textCtx = textCanvas.getContext("2d");

                    const img = new Image();
                    img.src = bImages[currentIndex].textDetectImg;

                    img.onload = () => {
                        // Set canvas size to match the image size
                        textCanvas.width = img.width;
                        textCanvas.height = img.height;

                        // Draw the image onto the canvas
                        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);  // Clear the canvas first
                        textCtx.drawImage(img, 0, 0);
                    };

                    img.onerror = (error) => {
                        console.error("Error loading the image from textDetectImg:", error);
                    };
                } else {
                    setCurrentImg(currImg);
                }

                // Auto Binarize Button Image
                const binarizedImg = await loadAndBinarizeImage(bImages[currentIndex].filepath, 127);
                setAutoBinarizeImage(binarizedImg);
            }
        }

        initializeCanvas();
    }, [currentIndex, bImages]);

    useEffect(() => {
        const runContentDetection = async () => {
            if (currentImg) {
                await contentDetection("text");
            }
        };

        runContentDetection();
    }, [currentImg]);

    const loadAndBinarizeImage = (filepath, threshold) => {
        return new Promise((resolve, reject) => {
            const hiddenCanvas = canvasRef.current;
            const hiddenCtx = hiddenCanvas.getContext("2d", { willReadFrequently: true });
            const mainCanvas = canvasMain.current;
            const mainCtx = mainCanvas.getContext("2d");

            const image = new Image();
            image.src = filepath;

            image.onload = () => {
                // Set canvas sizes to match the image
                hiddenCanvas.width = image.width;
                hiddenCanvas.height = image.height;

                mainCanvas.width = image.width;
                mainCanvas.height = image.height;

                // Draw the image on the hidden canvas
                hiddenCtx.drawImage(image, 0, 0);

                // Get image data for processing
                const imageData = hiddenCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
                const data = imageData.data;

                // Normalize threshold to a contrast factor (-1 to +1)
                const contrastFactor = threshold / 127;

                // Process the image: binarize based on the threshold
                if (threshold !== 0) {
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
                }

                // Update the hidden canvas with processed image data
                hiddenCtx.putImageData(imageData, 0, 0);

                // Draw the processed image from the hidden canvas onto the main canvas
                mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
                mainCtx.drawImage(hiddenCanvas, 0, 0);

                // Resolve the Promise with the binarized image data URL
                resolve(hiddenCanvas.toDataURL());
            };

            image.onerror = () => {
                console.error("Failed to load image:", filepath);
                reject(new Error("Image load error"));
            };
        });
    };


    const updateSliderStyle = (value, retry = true) => {
        const min = 0;
        const max = 255;
        const percentage = ((value - min) / (max - min)) * 100;

        // Set the custom CSS variable --value
        const slider = document.getElementById("threshold");
        if (slider) {
            slider.style.setProperty("--value", `${percentage}%`);
        } else if (retry) {
            console.warn("Slider element not found. Retrying in 1.5 seconds...");
            setTimeout(() => updateSliderStyle(value, false), 1500);
        } else {
            console.error("Slider element not found after retry.");
        }
    };

    const updateThreshold = (newThreshold) => {
        setCurrentThreshold(newThreshold);
        updateSliderStyle(newThreshold);
        bImages[currentIndex].threshold = newThreshold;

        loadAndBinarizeImage(bImages[currentIndex].filepath, newThreshold);
    };

    const applyThreshold = (newThreshold) => {
        loadAndBinarizeImage(bImages[currentIndex].filepath, newThreshold)
            .then((img) => {
                setCurrentImg(img);
            })
            .catch((error) => {
                console.error("Error binarizing image:", error);
            });
    };

    const handleIndexChange = (direction) => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + direction;
            // Ensure the new index stays within bounds
            if (newIndex < 0 || newIndex >= bImages.length) {
                return prevIndex;
            }
            return newIndex;
        });
    };

    const contentDetection = (type, rect = null) => {
        var img = new Image();
        switch (type) {
            case 'text':
                img = detectText(rect);
                break;
            default:
                console.error("Content Detection Type not recognized.");
                break;
        }

        return img;
    };

    const detectText = (rect = null) => {
        setCanvasLoadingStage(true);

        const hiddenCanvas = canvasRef.current;
        const hiddenCtx = hiddenCanvas.getContext("2d", { willReadFrequently: true });
        const mainCanvas = canvasMain.current;
        const mainCtx = mainCanvas.getContext("2d");
        const textCanvas = canvasText.current;
        const textCtx = textCanvas.getContext("2d");

        const detectImg = new Image();
        detectImg.src = currentImg;

        let imageLogs = [];
        let attempt = 0;
        const maxRetries = 3;

        const loadImage = () => {
            detectImg.onload = () => {
                // Set up hidden canvas
                if (rect) {
                    const { x, y, width, height } = rect;
                    hiddenCanvas.width = width;
                    hiddenCanvas.height = height;
                    hiddenCtx.drawImage(detectImg, x, y, width, height, 0, 0, width, height);
                } else {
                    hiddenCanvas.width = detectImg.width;
                    hiddenCanvas.height = detectImg.height;
                    hiddenCtx.drawImage(detectImg, 0, 0);
                }

                // Run Tesseract on cropped or full area
                const croppedImage = hiddenCanvas.toDataURL();

                Tesseract.recognize(croppedImage, "eng", {
                    logger: (info) => {
                        imageLogs.push(info);
                    },
                    tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
                })
                    .then(({ data }) => {
                        console.log(imageLogs);

                        const detectedText = [];
                        const mergedBoxes = [];

                        // Sort words by their y-coordinate
                        const sortedWords = data.words.sort((a, b) => a.bbox.y0 - b.bbox.y0);

                        sortedWords.forEach((word) => {
                            if (word.confidence > 80) {
                                let { text, bbox } = word;

                                // Adjust bounding box if rect is provided
                                if (rect) {
                                    const { x, y } = rect;
                                    bbox = {
                                        x0: bbox.x0 + x,
                                        y0: bbox.y0 + y,
                                        x1: bbox.x1 + x,
                                        y1: bbox.y1 + y,
                                    };
                                }

                                const { x0, y0, x1, y1 } = bbox;

                                // Merge nearby words into single boxes
                                if (mergedBoxes.length === 0) {
                                    mergedBoxes.push({ text, x0, y0, x1, y1 });
                                    return;
                                }

                                const lastBox = mergedBoxes[mergedBoxes.length - 1];
                                const isSameLine = Math.abs(lastBox.y0 - y0) < 5;
                                const isClose = x0 - lastBox.x1 < 5;

                                if (isSameLine && isClose) {
                                    lastBox.text += ` ${text}`;
                                    lastBox.x1 = x1;
                                    lastBox.y1 = Math.max(lastBox.y1, y1);
                                } else {
                                    mergedBoxes.push({ text, x0, y0, x1, y1 });
                                }
                            }
                        });

                        // Clear the textCanvas before redrawing
                        textCanvas.width = mainCanvas.width;
                        textCanvas.height = mainCanvas.height;
                        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

                        // Draw bounding boxes and detected text on the respective canvases
                        mergedBoxes.forEach((box) => {
                            const { text, x0, y0, x1, y1 } = box;
                            detectedText.push({ text, bbox: { x0, y0, x1, y1 } });

                            // Draw the bounding box on the mainCanvas
                            mainCtx.strokeStyle = "red";
                            mainCtx.lineWidth = 2;
                            mainCtx.strokeRect(x0, y0, x1 - x0, y1 - y0);

                            // Draw the text on the textCanvas
                            textCtx.font = "16px Arial";
                            textCtx.fillStyle = "black";
                            textCtx.fillText(text, x0, y0 - 5); // Position text slightly above the bounding box
                        });

                        setTextDetectImage(textCanvas.toDataURL());

                        // Ensure arrays exist before assigning values
                        if (!bImages[currentIndex].textDetectImg) {
                            bImages[currentIndex].textDetectImg = [];
                        }
                        if (!bImages[currentIndex].textBoxes) {
                            bImages[currentIndex].textBoxes = [];
                        }

                        // Save the generated data
                        bImages[currentIndex].textDetectImg = textCanvas.toDataURL();
                        bImages[currentIndex].textBoxes = mergedBoxes;

                    })
                    .catch((error) => {
                        console.error("Error detecting text:", error);
                    })
                    .finally(() => {
                        setCanvasLoadingStage(false);
                    });
            };

            detectImg.onerror = (error) => {
                if (attempt < maxRetries) {
                    attempt += 1;
                    console.error(`Error loading image, retrying (${attempt}/${maxRetries})...`);
                    setTimeout(loadImage, 1500); // Retry after 1.5 seconds
                } else {
                    console.error("Failed to load image after multiple attempts:", error);
                    setCanvasLoadingStage(false); // Ensure we stop loading stage on failure
                }
            };
        };

        loadImage();
    };

    const handleSubmit = (e) => {
        //didn't finish yet
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
                <h1 style={{ fontSize: "2.5em" }}>Content Detection</h1>
                <div className="container-fluid">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 mx-auto row justify-content-center"
                        style={{ maxWidth: "100%" }}
                    >
                        <div className="col-lg-10 col-md-10 col-12">
                            <div className="my-5">
                                <div className="d-flex justify-content-between mb-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => handleIndexChange(-1)}
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
                                        onClick={() => handleIndexChange(1)}
                                        disabled={currentIndex === bImages.length - 1}
                                    >
                                        Next &gt;
                                    </button>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    {/* <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleDrawButtonClick}
                                    >
                                        {drawing ? "Stop Drawing" : "Draw Rectangle"}
                                    </button> */}
                                </div>
                                <div className="row">
                                    {/* Showcase Image Section */}
                                    <div className="col-md-9">
                                        <div className="img-showcase p-3 bg-white text-center relative-container">
                                            {canvasLoadingStage && (
                                                <div className="overlay d-flex justify-content-center align-items-center">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                            )}
                                            {bImages[currentIndex] ? (
                                                <div className="main-content">
                                                    <div className="mt-3">
                                                        <canvas
                                                            ref={canvasMain}
                                                            // onMouseDown={handleMouseDown}
                                                            // onMouseMove={handleMouseMove}
                                                            // onMouseUp={handleMouseUp}
                                                            style={{
                                                                display: "block",
                                                                width: "100%",
                                                                maxHeight: "calc(100vh - 250px)",
                                                                objectFit: "contain",
                                                                border: "1px solid black",
                                                            }}
                                                        />
                                                    </div>
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
                                                            onInput={(e) => updateThreshold(parseInt(e.target.value, 10))}
                                                            onMouseUp={(e) => applyThreshold(parseInt(e.target.value, 10))} // Apply changes when mouse is released
                                                            onTouchEnd={(e) => applyThreshold(parseInt(e.target.value, 10))}
                                                            className="form-range w-100"
                                                        />
                                                    </div>
                                                    <div className="mt-3">
                                                        <canvas
                                                            ref={canvasText}
                                                            id="textLayer"
                                                            style={{
                                                                display: "block",
                                                                width: "100%",
                                                                maxHeight: "calc(100vh - 250px)",
                                                                objectFit: "contain",
                                                                border: "1px solid black",
                                                            }}
                                                        />
                                                        Text Layer
                                                    </div>
                                                </div>
                                            ) : (
                                                <p>There is some error, no image available.</p>
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
                                                    onClick={() => updateThreshold(0)}
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
                                                    onClick={() => updateThreshold(127)}
                                                    className="img-fluid mb-2"
                                                >
                                                    <img
                                                        src={autoBinarizeImage}
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

                                            {/* Text Detect Button */}
                                            <div className="mb-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => contentDetection('text')}
                                                    className="img-fluid mb-2"
                                                >
                                                    <img
                                                        src={textDetectImage}
                                                        alt="Text Detect"
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
                                                <p className="small text-muted">Detect Text</p>
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
