import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AddProduct: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [status, setStatus] = useState<string>("unsold");
    const [verificationStatus, setVerificationStatus] = useState<string>("incomplete");

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

        if (!name || !price || !category || !image || latitude === null || longitude === null) {
            setErrorMessage("All fields are required");
            return;
        }

        // Extract token from localStorage
        const token = localStorage.getItem("authToken");
        let userId = "";

        if (token) {
            try {
                // Decode the JWT token (assuming it's a JSON Web Token)
                const decodedToken = JSON.parse(atob(token.split(".")[1]));
                userId = decodedToken.id; // Adjust this based on how userId is stored in the token
                console.log("userId:", decodedToken);
            } catch (error) {
                console.error("Invalid token:", error);
                setErrorMessage("Invalid authentication token");
                return;
            }
        } else {
            setErrorMessage("User not authenticated");
            return;
        }

        // Create FormData
        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("status", status);
        formData.append("verification_status", verificationStatus);
        formData.append("latitude", latitude.toString());
        formData.append("longitude", longitude.toString());
        formData.append("image", image);
        formData.append("userId", userId); // Add userId to formData

        try {
            await axios.post("http://localhost:5000/image/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`, // Send token for authentication
                },
            });

            // Success message
            setSuccessMessage("✅ Product added successfully!");

            // Reset form fields
            setName("");
            setPrice("");
            setCategory("");
            setImage(null);
            setLatitude(null);
            setLongitude(null);
            setStatus("unsold");
            setVerificationStatus("incomplete");

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            setErrorMessage("An error occurred while adding the product");
            console.error("Error:", error);
        }
    };

    return (
        <div className="container mt-2" style={{ maxWidth: "600px", minHeight: "300px" }}>
            <div className="card shadow-lg p-3 rounded-4">
                <h2 className="text-center text-primary mb-3">Add Product</h2>
                {errorMessage && <p className="alert alert-danger text-center">{errorMessage}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">Name:</label>
                        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Price:</label>
                        <input type="number" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Category:</label>
                        <input type="text" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Status:</label>
                        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} required>
                            <option value="unsold">Unsold</option>
                            <option value="sold">Sold</option>
                            <option value="out of stock">Out of Stock</option>
                        </select>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Verification Status:</label>
                        <select className="form-select" value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)} required>
                            <option value="incomplete">Incomplete</option>
                            <option value="complete">Complete</option>
                        </select>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Image:</label>
                        <input type="file" className="form-control" onChange={handleImageChange} required />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Location:</label>
                        <div className="d-flex align-items-center">
                            <button type="button" className="btn btn-success me-2" onClick={handleLocationFetch}>
                                Get Location
                            </button>
                            {latitude && longitude && (
                                <span className="text-success">{latitude}, {longitude}</span>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Add Product</button>

                    {/* Success Message Below Submit Button */}
                    {successMessage && (
                        <p className="text-success text-center mt-2 fw-bold fade-in">
                            {successMessage}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
