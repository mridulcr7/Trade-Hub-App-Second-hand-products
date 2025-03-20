import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import useReverseGeocoding from "../Hooks/useReverseGeoCoding.tsx";

interface Product {
    id: string;
    name: string;
    price: string;
    status: string;
    category: string;
    image_urls: string[];
    updated_at: string;
    description: string;
    lat: number;
    lon: number;
    seller_id: string | null;
}

interface Seller {
    id: string;
    name: string;
    email: string;
    contact: string;
    image_url: string;
}

const ViewDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [seller, setSeller] = useState<Seller | null>(null);
    const navigate = useNavigate();

    const { address, error } = useReverseGeocoding(product?.lat, product?.lon);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/product/${id}`);
                const data = await response.json();
                //console.log("Product Data:", data); // ✅ Log entire response

                if (!data) {
                    console.error("Error: No product data received!");
                    return;
                }

                setProduct(data.product);

                if (data.product.seller_id) {
                    console.log("Fetching seller details for seller_id:", data.seller_id);
                    fetchSellerDetails(data.product.seller_id);
                } else {
                    console.error("Error: seller_id is missing from product data");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };


        const fetchSellerDetails = async (id: string) => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    console.error("No token found");
                    return;
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ id }),
                });

                const sellerData = await response.json();
                console.log("Seller Data", sellerData);
                setSeller(sellerData.user);
            } catch (error) {
                console.error("Error fetching seller details:", error);
            }
        };

        fetchProduct();

    }, [id]);

    const handleChatClick = async () => {
        if (!seller) return;

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.error("No token found");
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/user/${seller.id}/messages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const data = await response.json();
            console.log("Navigating with recipient:", {
                id: seller.id,
                name: seller.name,
                image_url: seller.image_url
            });

            // Navigate with properly structured state
            navigate(`/chats/${data.chat_id}`, {
                state: {
                    recipient: {
                        id: seller.id,
                        name: seller.name,
                        image_url: seller.image_url
                    }
                }
            });
        } catch (error) {
            console.error("Error initiating chat:", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row">
                {/* Left Section: Product Images & Description */}
                <div className="col-md-6">
                    <div className="card shadow p-3 mb-4">
                        <div id="productCarousel" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-inner">
                                {product?.image_urls?.map((url, index) => (
                                    <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={index}>
                                        <img
                                            src={url}
                                            className="d-block w-100"
                                            alt={product.name}
                                            style={{ maxHeight: "300px", objectFit: "cover" }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon"></span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                                <span className="carousel-control-next-icon"></span>
                            </button>
                        </div>
                        <div className="card-body">
                            <h3 className="card-title  text-center" style={{ color: "#9279D2" }} >{product?.name}</h3>
                            <p><strong>Category:</strong> {product?.category}</p>
                            <p><strong>Description:</strong> {product?.description}</p>
                        </div>
                    </div>
                </div>

                {/* Right Section: Price, Seller Details & Location */}
                <div className="col-md-4 ms-md-5">
                    {/* Price Section */}
                    <div className="card shadow p-3 mb-4 text-center">
                        <h2 className="text-danger fw-bold">₹{product?.price}</h2>
                    </div>

                    {/* Seller Details */}
                    {seller && (
                        <div className="card shadow p-3 mb-4">
                            <div className="text-center">
                                <img
                                    src={seller.image_url}
                                    className="rounded-circle mb-2"
                                    width="80"
                                    height="80"
                                    alt="Seller"
                                />
                                <h5>{seller.name}</h5>
                                <p><FaEnvelope /> {seller.email}</p>
                                <p><FaPhoneAlt /> {seller.contact}</p>
                                <button
                                    className="btn w-100"
                                    onClick={handleChatClick}
                                    style={{ backgroundColor: "#9279D2", color: "white", width: "100%" }}
                                >
                                    Chat with Seller
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Location Details */}
                    {product && (
                        <div className="card shadow p-3">
                            <h5><FaMapMarkerAlt /> Location</h5>
                            {error ? (
                                <p>{error}</p> // If there's an error, display it
                            ) : (
                                <p>{address || "Location not available"}</p> // Show the address or a fallback message
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewDetails;
