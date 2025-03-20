import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import axios from "axios"; // Import axios

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    status: string;
    category: string;
    verification_status: string;
    created_at: string;
    lat?: number;
    lon?: number;
    image_urls: string[];
}

interface DecodedToken {
    id: string;
    email: string;
    iat: number;
    exp: number;
}

const ViewAddedProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchUserProducts = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    console.error("No token found");
                    return;
                }

                const decoded = jwtDecode<DecodedToken>(token);
                const userId = decoded.id;

                const response = await fetch("http://localhost:5000/product/user", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ userId }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }

                const data = await response.json();
                console.log(data)
                setProducts(data.products);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user products:", error);
                setLoading(false);
            }
        };

        fetchUserProducts();
    }, []);

    // Fetch addresses separately
    useEffect(() => {
        const fetchAddresses = async () => {
            const newAddresses: { [key: string]: string } = {};
            await Promise.all(
                products.map(async (product) => {
                    if (product.lat && product.lon) {
                        try {
                            const api = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${product.lat}&lon=${product.lon}`;
                            const response = await axios.get(api);
                            newAddresses[product.id] = response.data.display_name || "Unknown Location";
                        } catch (error) {
                            newAddresses[product.id] = "Unknown Location";
                        }
                    }
                })
            );
            setAddresses(newAddresses);
        };

        if (products.length > 0) {
            fetchAddresses();
        }
    }, [products]);

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4" style={{ color: "#9279D2" }}>Your Added Products</h2>
            <div className="row">
                {products.length === 0 ? (
                    <p className="text-center">No products found.</p>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="col-md-4 mb-4">
                            <div className="card shadow">
                                <img
                                    src={product.image_urls[0] || "placeholder.jpg"}
                                    alt={product.name}
                                    className="card-img-top"
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text">{product.description}</p>
                                    <p className="card-text fw-bold">Rs.{product.price}</p>
                                    <p className="card-text">
                                        <strong>Status:</strong> {product.status}
                                    </p>
                                    <p className="card-text">
                                        <strong>Verification:</strong> {product.verification_status}
                                    </p>
                                    <p className="card-text">
                                        <strong>Location:</strong> {addresses[product.id] || "Fetching..."}
                                    </p>
                                    <p className="card-text">
                                        <strong>Description:</strong> {product.description ? product.description : "No description given"}
                                    </p>

                                    <div className="d-flex justify-content-between">
                                        <Link to={`/edit-products/${product.id}`} className="btn btn-warning">
                                            Update Product
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ViewAddedProducts;
