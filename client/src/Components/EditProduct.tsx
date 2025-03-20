import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// interface Product {
//     id: string;
//     name: string;
//     price: number;
//     description: string | null;
//     image_url: string;
//     status: string;
//     verification_status: string;
//     latitude?: number;
//     longitude?: number;
//     // latitude: 28.5936,
//     // longitude: 77.2295
// }

const fetchProduct = async (productId: string) => {
    const response = await axios.get(`http://localhost:5000/product/${productId}`);
    return response.data.product;
};

const updateProduct = async (updatedFields: any) => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("User not authenticated.");

    return axios.put("http://localhost:5000/product/update", updatedFields, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
};

const EditProduct: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch product data
    const { data: originalProduct, isLoading, isError } = useQuery({
        queryKey: ["product", productId],
        queryFn: () => fetchProduct(productId!),
    });

    // Form state
    const [price, setPrice] = useState<string>("");
    const [status, setStatus] = useState<string>("unsold");
    const [verification, setVerification] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    // Update state when data is loaded
    useEffect(() => {
        if (originalProduct) {
            setPrice(originalProduct.price.toString());
            setStatus(originalProduct.status);
            setVerification(originalProduct.verification_status);
            setDescription(originalProduct.description || ""); // Handle null case
            setLatitude(originalProduct.latitude || null);
            setLongitude(originalProduct.longitude || null);
        }
    }, [originalProduct]);

    // Update product mutation
    const mutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            setSuccessMessage("✅ Product updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["product", productId] });
            setTimeout(() => {
                navigate("/view-added-products");
            }, 2000);
        },
        onError: (error: any) => {
            if (axios.isAxiosError(error)) {
                const backendMessage = error.response?.data?.message || "An unexpected error occurred.";
                setErrorMessage(`❌ ${backendMessage}`);
            } else {
                setErrorMessage("❌ Something went wrong. Please try again.");
            }
        },
    });

    if (isLoading) return <div className="text-center mt-5">Loading product...</div>;
    if (isError) return <div className="text-center mt-5 text-danger">Error loading product.</div>;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) setImage(e.target.files[0]);
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
            () => setErrorMessage("Unable to fetch location. Please allow location access.")
        );
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const updatedFields: any = { id: productId };
        if (price !== originalProduct?.price.toString()) updatedFields.price = price;
        if (status !== originalProduct?.status) updatedFields.status = status;
        if (verification !== originalProduct?.verification_status) updatedFields.verification_status = verification;
        if (description !== originalProduct?.description) updatedFields.description = description;
        if (image) updatedFields.image = image;
        if (latitude !== originalProduct?.latitude) updatedFields.latitude = latitude;
        if (longitude !== originalProduct?.longitude) updatedFields.longitude = longitude;

        if (Object.keys(updatedFields).length === 0) {
            setErrorMessage("No changes were made.");
            return;
        }

        mutation.mutate(updatedFields);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "600px", minHeight: "300px" }}>
            <div className="card shadow-lg p-3 rounded-4">
                <h2 className="text-center  mb-3" style={{ color: "#9279D2" }}>Edit Product</h2>
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

                    <div className="mb-2">
                        <label className="form-label">Description:</label>
                        <textarea
                            className="form-control"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter product description"
                        ></textarea>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Image:</label>
                        <input type="file" className="form-control" onChange={handleImageChange} />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Location:</label>
                        <div className="d-flex align-items-center">
                            <button type="button" className="btn btn-success me-2" onClick={handleLocationFetch}>
                                Get Location
                            </button>
                            {latitude && longitude && <span className="text-success">{latitude}, {longitude}</span>}
                        </div>
                    </div>

                    <button type="submit" className="btn w-100" style={{ backgroundColor: "#9279D2", color: "white" }} disabled={mutation.isPending}>
                        {mutation.isPending ? "Updating..." : "Update Product"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
