import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";

import backgroundImage from "/resources/img/estate_property_background.jpg";
import PropertyFormModal from "@/Components/Property/PropertyFormModal";
import Header from "@/Layouts/HeaderMenu";
import NewLaunchListing from "@/Components/Property/NewLaunchListing";
import LatestListings from "@/Components/Property/LatestListings";
import RentListings from "@/Components/Property/RentListings";
import Footer from "@/Layouts/Footer";
import Icon from "/resources/img/flats.png";

export default function Main({ auth }) {
    const [isBuy, setIsBuy] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [propertyList, setPropertyList] = useState([]);
    const [priceMin, setMinPrice] = useState(0);
    const [priceMax, setMaxPrice] = useState(1000000000);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleMinPriceChange = (e) => {
        setMinPrice(e.target.value);
    };

    const handleMaxPriceChange = (e) => {
        setMaxPrice(e.target.value);
    };

    const handleApplyFilters = () => {
        setActiveDropdown(null);
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;

        if (category === "All") {
            if (selectedCategories.includes("All")) {
                setSelectedCategories([]);
            } else {
                setSelectedCategories(["All", "New Launch", "Subsale"]);
            }
        } else {
            setSelectedCategories((prevState) => {
                let newSelectedCategories = prevState.includes(category)
                    ? prevState.filter((item) => item !== category)
                    : [...prevState, category];

                if (
                    newSelectedCategories.includes("New Launch") &&
                    newSelectedCategories.includes("Subsale") &&
                    !newSelectedCategories.includes("All")
                ) {
                    newSelectedCategories = [...newSelectedCategories, "All"];
                }

                if (newSelectedCategories.length < 3) {
                    newSelectedCategories = newSelectedCategories.filter(
                        (item) => item !== "All"
                    );
                }

                return newSelectedCategories;
            });
        }
    };

    const handlePropertyTypeChange = (e) => {
        const propertyType = e.target.value;

        if (propertyType === "All Property") {
            if (selectedPropertyTypes.includes("All Property")) {
                setSelectedPropertyTypes([]);
            } else {
                setSelectedPropertyTypes([
                    "All Property",
                    "Conventional Condominium",
                    "Bare Land Condominium",
                    "Commercial",
                ]);
            }
        } else {
            setSelectedPropertyTypes((prevState) => {
                let newSelectedPropertyTypes = prevState.includes(propertyType)
                    ? prevState.filter((item) => item !== propertyType)
                    : [...prevState, propertyType];

                if (
                    newSelectedPropertyTypes.includes(
                        "Conventional Condominium"
                    ) &&
                    newSelectedPropertyTypes.includes(
                        "Bare Land Condominium"
                    ) &&
                    newSelectedPropertyTypes.includes("Commercial") &&
                    !newSelectedPropertyTypes.includes("All Property")
                ) {
                    newSelectedPropertyTypes = [
                        ...newSelectedPropertyTypes,
                        "All Property",
                    ];
                }

                if (newSelectedPropertyTypes.length < 4) {
                    newSelectedPropertyTypes = newSelectedPropertyTypes.filter(
                        (item) => item !== "All Property"
                    );
                }

                return newSelectedPropertyTypes;
            });
        }
    };

    const toggleDropdown = (dropdown) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            let saleType = selectedCategories;
            if (
                saleType.includes("New Launch") &&
                saleType.includes("Subsale") &&
                saleType.includes("All")
            ) {
                saleType = ["All"];
            }

            let propertyType = selectedPropertyTypes;
            if (
                propertyType.includes("Conventional Condominium") &&
                propertyType.includes("Bare Land Condominium") &&
                propertyType.includes("Commercial") &&
                propertyType.includes("All Property")
            ) {
                propertyType = ["All Property"];
            }

            const params = {
                priceMin,
                priceMax,
                searchQuery,
            };

            if (saleType.length > 0) {
                params.saleType = saleType.join(",");
            }

            if (propertyType.length > 0) {
                params.propertyType = propertyType.join(",");
            }

            const queryParams = new URLSearchParams(params);
            const basePath = isBuy ? "/buy" : "/rent";
            const searchUrl = `${basePath}?${queryParams.toString()}`;

            window.location.href = searchUrl;
        } catch (error) {
            console.error("Error with search:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async (query) => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `/api/search-addresses?query=${query}`
            );
            const data = await response.json();
            console.log("main suggestion: ", data);
            setSuggestions(data);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        fetchSuggestions(value);
        // setSuggestions(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const baseURL = `${window.location.origin}/property`;
                const response = await axios.get(baseURL);
                console.log("response", response);
                setPropertyList(response.data);
            } catch (error) {
                console.error("Error fetching property data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isBuy]);

    const handleBlur = () => {
        setTimeout(() => {
            setSuggestions(false);
        }, 200);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(
            `${suggestion.property_address_line_1}, ${suggestion.property_address_line_2}, ${suggestion.city}`
        );
        setSuggestions(false);
    };

    return (
        <>
            <Head title="Main" />
            <Header auth={auth} />

            <main className="pt-32 mt-12 min-h-screen bg-gray-100 flex flex-col items-center">
                <div
                    className="relative w-full max-w-4xl h-80 bg-cover bg-center mb-8"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                >
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-3xl bg-[#f7f1e8] p-8 rounded-xl shadow-lg">
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={() => setIsBuy(true)}
                                className={`px-6 py-2 font-bold rounded-l-full ${
                                    isBuy
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setIsBuy(false)}
                                className={`px-6 py-2 font-bold rounded-r-full ${
                                    !isBuy
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                Rent
                            </button>
                        </div>

                        <div className="flex items-center bg-white p-2 rounded-full shadow-md mb-4">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    placeholder="Search here..."
                                    className="w-full bg-transparent border-none focus:outline-none px-4 rounded-full"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    onFocus={() => setSuggestions(true)}
                                    onBlur={handleBlur}
                                />
                                {suggestions.length > 0 && (
                                    <ul className="absolute bg-white border border-gray-300 w-full max-h-40 overflow-auto z-10 rounded-lg shadow-lg">
                                        {suggestions.map(
                                            (suggestion, index) => (
                                                <li
                                                    key={index}
                                                    className="p-4 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                                                    onMouseDown={() =>
                                                        handleSuggestionClick(
                                                            suggestion
                                                        )
                                                    }
                                                >
                                                    <div>
                                                        <p className="text-gray-700 font-semibold">
                                                            {
                                                                suggestion.property_address_line_1
                                                            }
                                                            ,{" "}
                                                            {
                                                                suggestion.property_address_line_2
                                                            }
                                                            , {suggestion.city}
                                                        </p>
                                                        <p className="text-sm text-gray-500 flex items-center">
                                                            <img
                                                                src={Icon}
                                                                alt="Property Icon"
                                                                className="w-4 h-4 mr-2"
                                                            />
                                                            {
                                                                suggestion.property_name
                                                            }{" "}
                                                            <span className="inline-block bg-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full ml-2">
                                                                {
                                                                    suggestion.property_type
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}
                            </div>

                            <button
                                onClick={handleSearch}
                                className="bg-red-500 text-white px-6 py-2 rounded-full"
                            >
                                Search
                            </button>
                        </div>

                        <div className="flex justify-around">
                            {isBuy && (
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            toggleDropdown("category")
                                        }
                                        className="bg-transparent border-none focus:outline-none text-gray-700 rounded-full px-4 py-2 flex items-center space-x-2"
                                    >
                                        <span>Categories</span>
                                        <span>
                                            {activeDropdown === "category" ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 15l7-7 7 7"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                    </button>
                                    {activeDropdown === "category" && (
                                        <div className="absolute bg-white border rounded-lg shadow-lg mt-2 w-56 p-4 max-h-60 overflow-y-auto z-10">
                                            <div className="space-y-3">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        value="All"
                                                        onChange={
                                                            handleCategoryChange
                                                        }
                                                        checked={selectedCategories.includes(
                                                            "All"
                                                        )}
                                                        className="form-checkbox text-red-500"
                                                    />
                                                    <label className="ml-2 text-gray-800 text-sm font-medium">
                                                        All
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        value="New Launch"
                                                        onChange={
                                                            handleCategoryChange
                                                        }
                                                        checked={selectedCategories.includes(
                                                            "New Launch"
                                                        )}
                                                        className="form-checkbox text-red-500"
                                                    />
                                                    <label className="ml-2 text-gray-800 text-sm font-medium">
                                                        New Launch
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        value="Subsale"
                                                        onChange={
                                                            handleCategoryChange
                                                        }
                                                        checked={selectedCategories.includes(
                                                            "Subsale"
                                                        )}
                                                        className="form-checkbox text-red-500"
                                                    />
                                                    <label className="ml-2 text-gray-800 text-sm font-medium">
                                                        Subsale
                                                    </label>
                                                </div>
                                                <div className="px-4 py-2 text-center">
                                                    <button
                                                        onClick={
                                                            handleApplyFilters
                                                        }
                                                        className="bg-red-500 text-white px-4 py-2 rounded-full w-full"
                                                    >
                                                        Apply Filters
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() =>
                                        toggleDropdown("propertyType")
                                    }
                                    className="bg-transparent border-none focus:outline-none text-gray-700 rounded-full px-4 py-2 flex items-center space-x-2"
                                >
                                    <span>All Property</span>
                                    <span>
                                        {activeDropdown === "propertyType" ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 15l7-7 7 7"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                </button>
                                {activeDropdown === "propertyType" && (
                                    <div className="absolute bg-white border rounded-lg shadow-lg mt-2 w-60 p-4 max-h-60 overflow-y-auto z-10">
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    value="All Property"
                                                    onChange={
                                                        handlePropertyTypeChange
                                                    }
                                                    checked={selectedPropertyTypes.includes(
                                                        "All Property"
                                                    )}
                                                    className="form-checkbox text-red-500"
                                                />
                                                <label className="ml-2 text-gray-800 text-sm font-medium">
                                                    All
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    value="Conventional Condominium"
                                                    onChange={
                                                        handlePropertyTypeChange
                                                    }
                                                    checked={selectedPropertyTypes.includes(
                                                        "Conventional Condominium"
                                                    )}
                                                    className="form-checkbox text-red-500"
                                                />
                                                <label className="ml-2 text-gray-800 text-sm font-medium">
                                                    Conventional Condominium
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    value="Bare Land Condominium"
                                                    onChange={
                                                        handlePropertyTypeChange
                                                    }
                                                    checked={selectedPropertyTypes.includes(
                                                        "Bare Land Condominium"
                                                    )}
                                                    className="form-checkbox text-red-500"
                                                />
                                                <label className="ml-2 text-gray-800 text-sm font-medium">
                                                    Bare Land Condominium
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    value="Commercial"
                                                    onChange={
                                                        handlePropertyTypeChange
                                                    }
                                                    checked={selectedPropertyTypes.includes(
                                                        "Commercial"
                                                    )}
                                                    className="form-checkbox text-red-500"
                                                />
                                                <label className="ml-2 text-gray-800 text-sm font-medium">
                                                    Commercial
                                                </label>
                                            </div>
                                            <div className="px-4 py-2 text-center">
                                                <button
                                                    onClick={handleApplyFilters}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-full w-full"
                                                >
                                                    Apply Filters
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown("price")}
                                    className="bg-transparent border-none focus:outline-none text-gray-700 rounded-full px-4 py-2 flex items-center space-x-2"
                                >
                                    <span>Price</span>
                                    <span>
                                        {activeDropdown === "price" ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 15l7-7 7 7"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                </button>
                                {activeDropdown === "price" && (
                                    <div className="absolute bg-white border rounded shadow-lg mt-2 w-48">
                                        <div className="px-4 py-2">
                                            <label className="block text-sm">
                                                Min Price
                                            </label>
                                            <input
                                                type="number"
                                                value={priceMin}
                                                onChange={handleMinPriceChange}
                                                className="w-full p-2 border rounded mt-1"
                                                placeholder="Enter Min Price"
                                            />
                                        </div>
                                        <div className="px-4 py-2">
                                            <label className="block text-sm">
                                                Max Price
                                            </label>
                                            <input
                                                type="number"
                                                value={priceMax}
                                                onChange={handleMaxPriceChange}
                                                className="w-full p-2 border rounded mt-1"
                                                placeholder="Enter Max Price"
                                            />
                                        </div>
                                        <div className="px-4 py-2 text-center">
                                            <button
                                                onClick={handleApplyFilters}
                                                className="bg-red-500 text-white px-4 py-2 rounded-full w-full"
                                            >
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={openModal}
                                className="bg-red-500 text-white px-6 py-2 rounded-full"
                            >
                                Apply for Property
                            </button>
                        </div>
                    </div>
                </div>

                <PropertyFormModal isOpen={isModalOpen} onClose={closeModal} />

                {loading ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="w-16 h-16 border-t-4 border-red-500 border-solid rounded-full animate-spin"></div>
                    </div>
                ) : propertyList.length === 0 ? (
                    <div className="text-center text-lg font-semibold text-gray-600 mt-8">
                        No listings available at the moment.
                    </div>
                ) : (
                    <div>
                        {isBuy ? (
                            <>
                                <div className="mb-8">
                                    <NewLaunchListing
                                        properties={propertyList}
                                    />
                                </div>
                                <div>
                                    <LatestListings properties={propertyList} />
                                </div>
                            </>
                        ) : (
                            <RentListings properties={propertyList} />
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
