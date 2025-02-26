import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
    status: string;
    verification_status: string;
}

const EditProduct: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();

    const [originalProduct, setOriginalProduct] = useState<Product | null>(null);  // To store the original product data
    const [price, setPrice] = useState<string>("");
    const [status, setStatus] = useState<string>("unsold");
    const [verification, setVerification] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:5000/product/${productId}`);
                const data = await response.json();

                if (data.product) {
                    setOriginalProduct(data.product);
                    setPrice(data.product.price.toString());
                    setStatus(data.product.status);
                    setLatitude(data.product.latitude);
                    setLongitude(data.product.longitude);
                    setVerification(data.product.verification_status);
                }
            } catch (error) {
                setErrorMessage("Error fetching product details.");
            }
        };

        fetchProduct();
    }, [productId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]);
        }
    };

    const handleLocationFetch = () => {
        if (!navigator.geolocation) {
            setErrorMessage("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            },
            (error) => {
                setErrorMessage("Unable to fetch location. Please allow location access.");
                console.error(error);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const updatedFields: any = { id: productId };

        // Only include fields that are modified
        if (price !== originalProduct?.price.toString()) {
            updatedFields.price = price;
        }
        if (status !== originalProduct?.status) {
            updatedFields.status = status;
        }

        // Fixing verification_status comparison
        if (verification !== originalProduct?.verification_status) {
            updatedFields.verification_status = verification;
        }

        if (image) {
            updatedFields.image = image;
        }
        if (latitude !== originalProduct?.latitude) {
            updatedFields.latitude = latitude;
        }
        if (longitude !== originalProduct?.longitude) {
            updatedFields.longitude = longitude;
        }

        if (Object.keys(updatedFields).length === 0) {
            setErrorMessage("No changes were made.");
            return;
        }

        // Extract token from localStorage
        const token = localStorage.getItem("authToken");
        if (!token) {
            setErrorMessage("User not authenticated.");
            return;
        }

        try {
            console.log(updatedFields)
            await axios.put("http://localhost:5000/product/update", updatedFields, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccessMessage("✅ Product updated successfully!");
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

            navigate("/view-added-products");
        } catch (error) {
            setErrorMessage("An error occurred while updating the product.");
            console.error("Error:", error);
        }
    };

    if (!originalProduct) {
        return <div className="text-center mt-5">Loading product...</div>;
    }

    return (
        <div className="container mt-5" style={{ maxWidth: "600px", minHeight: "300px" }}>
            <div className="card shadow-lg p-3 rounded-4">
                <h2 className="text-center text-primary mb-3">Edit Product</h2>
                {errorMessage && <p className="alert alert-danger text-center">{errorMessage}</p>}
                {successMessage && <p className="text-success text-center">{successMessage}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">Price:</label>
                        <input
                            type="number"
                            className="form-control"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Status:</label>
                        <select
                            className="form-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="unsold">Unsold</option>
                            <option value="sold">Sold</option>
                            <option value="out of stock">Out of Stock</option>
                        </select>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Verification Status:</label>
                        <select
                            className="form-select"
                            value={verification}
                            onChange={(e) => setVerification(e.target.value)}
                        >
                            <option value="complete">Complete</option>
                            <option value="incomplete">Incomplete</option>
                        </select>
                    </div>



                    {/* <div className="mb-2">
                        <label className="form-label">Verification_Status:</label>
                        <select
                            className="form-select"
                            value={verification}
                            onChange={(e) => setVerification(e.target.value)}
                        >
                            <option value="complete">Complete</option>
                            <option value="incomplete">Incomplete</option>

                        </select>
                    </div> */}

                    <div className="mb-2">
                        <label className="form-label">Image:</label>
                        <input
                            type="file"
                            className="form-control"
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Location:</label>
                        <div className="d-flex align-items-center">
                            <button
                                type="button"
                                className="btn btn-success me-2"
                                onClick={handleLocationFetch}
                            >
                                Get Location
                            </button>
                            {latitude && longitude && (
                                <span className="text-success">{latitude}, {longitude}</span>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Update Product
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
