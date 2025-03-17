import { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";

const AddProduct: React.FC = () => {
    const [formState, setFormState] = useState({
        name: "",
        price: "",
        category: "",
        status: "unsold",
        verificationStatus: "incomplete",
        image: null as File | null,
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormState((prev) => ({ ...prev, image: file }));
    };

    const handleLocationFetch = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormState((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));
            },
            () => alert("Unable to fetch location. Please allow location access.")
        );
    };



    const mutation = useMutation({
        mutationFn: async () => {
            const { name, price, category, status, verificationStatus, image, latitude, longitude } = formState;

            if (!name || !price || !category || !image || latitude === null || longitude === null) {
                throw new Error("All fields are required");
            }

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("User not authenticated");

            const decodedToken = JSON.parse(atob(token.split(".")[1]));
            const userId = decodedToken.id;

            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("status", status);
            formData.append("verification_status", verificationStatus);
            formData.append("latitude", latitude.toString());
            formData.append("longitude", longitude.toString());
            formData.append("image", image);
            formData.append("userId", userId);

            await axios.post("http://localhost:5000/image/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
        },
    });



    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutation.mutate();
        console.log(mutation)
    };

    return (
        <div className="container mt-2" style={{ maxWidth: "600px", minHeight: "300px" }}>
            <div className="card shadow-lg p-3 rounded-4">
                <h2 className="text-center text-primary mb-3">Add Product</h2>
                {mutation.isError && <p className="alert alert-danger text-center">{(mutation.error as Error).message}</p>}
                {mutation.isSuccess && <p className="alert alert-success text-center">✅ Product added successfully!</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">Name:</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={formState.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Price:</label>
                        <input
                            type="number"
                            name="price"
                            className="form-control"
                            value={formState.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Category:</label>
                        <input
                            type="text"
                            name="category"
                            className="form-control"
                            value={formState.category}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Status:</label>
                        <select
                            name="status"
                            className="form-select"
                            value={formState.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="unsold">Unsold</option>
                            <option value="sold">Sold</option>
                            <option value="out of stock">Out of Stock</option>
                        </select>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Verification Status:</label>
                        <select
                            name="verificationStatus"
                            className="form-select"
                            value={formState.verificationStatus}
                            onChange={handleChange}
                            required
                        >
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
                            {formState.latitude && formState.longitude && (
                                <span className="text-success">
                                    {formState.latitude}, {formState.longitude}
                                </span>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={mutation.isPending}>
                        {mutation.isPending ? "Adding..." : "Add Product"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
