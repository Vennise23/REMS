import { useState } from "react";

const AddressAutocomplete = ({ onSelect }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const fetchSuggestions = async (query) => {
        if (query.length < 3) return; // Avoid too many API calls
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setSuggestions(data);
    };

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    fetchSuggestions(e.target.value);
                }}
                placeholder="Type address..."
                className="border p-2 w-full"
            />
            {suggestions.length > 0 && (
                <ul className="border mt-1 bg-white">
                    {suggestions.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => {
                                onSelect(item);
                                setQuery(item.display_name);
                                setSuggestions([]);
                            }}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                        >
                            {item.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AddressAutocomplete;
