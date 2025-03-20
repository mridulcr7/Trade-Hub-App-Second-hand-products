import { useState, useRef, useEffect } from "react";
import axios from "axios";
import useGeolocation from "../Hooks/useGeoLocation";
import ProductCard from "./ProductCard";
import { FaSearch } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as React from "react";

// Define available states and categories
const states = ["Andhra Pradesh", "Bihar", "Delhi", "Karnataka", "Maharashtra", "Uttar Pradesh"];
const categories = [
    "Mobiles",
    "Cars",
    "Bikes",
    "Properties",
    "Electronics & Appliances",
    "Furniture",
    "Fashion",
    "Books, Sports & Hobbies",
    "Pets",
    "Commercial Vehicles & Spares",
    "Jobs",
    "Services",
];


// interface Product {
//     id: string;
//     name: string;
//     price: string;
//     status: string;
//     category: string;
//     image_urls: string[];
//     updated_at: string;
//     lat: number;
//     lon: number;
// }

// Function to fetch products (Paginated and Random fetching)
const fetchProducts = async ({ pageParam = 1, queryKey }: { pageParam: number; queryKey: any }) => {
    const [, filters] = queryKey;

    // Check if filters are empty (i.e., no search performed)
    const isRandom = !filters.category && !filters.selectedState;

    const response = await axios.post("http://localhost:5000/product/get-products", {
        ...filters,
        page: pageParam,
        limit: 3, // Fetch 3 products per request
        random: isRandom, // Backend should handle this flag to return random products
    });

    console.log(response.data); // Debugging log

    return response.data;
};

const Home = () => {
    const { location } = useGeolocation();
    const [category, setCategory] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Extract userId from authToken (with safety check)
    const token = localStorage.getItem("authToken");
    let userId: string | null = null;
    if (token) {
        try {
            const decodedToken: any = jwtDecode(token);
            userId = decodedToken.id;
        } catch (error) {
            console.error("Invalid Token", error);
        }
    }

    // Prepare filters for query
    const filters: any = { category, selectedState, userId };

    // If user selects "Use Current Location", send lat & long
    if (selectedState === "current-location" && location) {
        filters.lat = location.latitude;
        filters.long = location.longitude;
    }

    // Fetch products using Infinite Query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["product", filters],
        queryFn: fetchProducts,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            console.log("Last Page Data:", lastPage); // Debugging log
            return lastPage.length > 0 ? allPages.length + 1 : undefined; // Stop fetching when empty
        },
        enabled: true,
    });

    // Observer for Infinite Scrolling
    const observerRef = useRef(null);

    useEffect(() => {
        const observerElement = observerRef.current;

        if (!observerElement || !hasNextPage) return; // Stop observing if no more pages

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1 }
        );
        console.log("hasNextPage:", hasNextPage);

        observer.observe(observerElement);

        return () => observer.unobserve(observerElement); // Ensure cleanup
    }, [hasNextPage, fetchNextPage]);

    // Handle search button click
    const handleSearch = () => {
        if (!category || !selectedState) {
            setErrorMessage("Please select both category and location to search for products.");
            return; // Prevent search if both fields are not selected
        }

        setErrorMessage(""); // Clear error message if both fields are selected
        refetch(); // Refetch products with new filters
    };

    return (
        <div className="container mt-4">
            <div className="row align-items-center mb-4">
                {/* State Selection Dropdown */}
                <div className="col-md-4 mb-3">
                    <select
                        className="form-select"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                    >
                        <option value="">Select State</option>
                        <option value="current-location">Use Current Location</option>
                        {states.map((state) => (
                            <option key={state} value={state}>
                                {state}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Selection + Search Button */}
                <div className="col-md-4 mb-3 d-flex align-items-center">
                    <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: "70%" }}
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Search Button */}
                    <button className="btn btn-success ms-2" onClick={handleSearch} style={{ width: "30%" }}>
                        <FaSearch />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-warning">
                    {errorMessage}
                </div>
            )}

            {/* Product Display */}
            <div className="row mt-4">
                {data?.pages?.length ? (
                    data.pages.map((page, pageIndex) => (
                        <React.Fragment key={pageIndex}>
                            {page.length > 0 ? (
                                page.map((product: any) => (
                                    // Display 3 products per row
                                    <div key={product.id} className="col-md-4 mb-4">
                                        <ProductCard key={product.id} product={product} />
                                    </div>
                                ))
                            ) : (
                                <p>No products found</p>
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <p>No products found</p>
                )}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasNextPage && (
                <div ref={observerRef} style={{ height: 20, background: "transparent" }}>
                    {isFetchingNextPage && <p>Loading more...</p>}
                </div>
            )}

        </div>
    );
};

export default Home;
