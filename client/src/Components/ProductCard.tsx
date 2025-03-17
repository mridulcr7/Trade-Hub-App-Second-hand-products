import React from "react";
import useReverseGeocoding from "../Hooks/useReverseGeocoding";

interface Product {
    id: string;
    name: string;
    price: string;
    status: string;
    category: string;
    image_urls: string[];
    updated_at: string;
    lat: number;
    lon: number;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const { address } = useReverseGeocoding(product.lat, product.lon); // ✅ Pass lat/lon

    const formattedDate = new Date(product.updated_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="card shadow-sm h-100">
            {/* Status Badge */}
            <div className="position-relative">
                <span
                    className={`position-absolute top-0 start-0 badge ${product.status === "sold" ? "bg-danger" : "bg-success"}`}
                    style={{ fontSize: "0.8rem" }}
                >
                    {product.status.toUpperCase()}
                </span>
            </div>

            {/* Product Image */}
            <img
                src={product.image_urls.length > 0 ? product.image_urls[0] : "https://via.placeholder.com/150"}
                alt={product.name}
                className="card-img-top"
                style={{ height: "250px", objectFit: "cover" }} // Controls image height
            />

            {/* Card Body */}
            <div className="card-body">
                <h5 className="card-title" style={{ fontSize: "1.25rem" }}>{product.name}</h5>
                <p className="card-text" style={{ fontSize: "1.1rem", color: "red" }}>₹{product.price}</p>

                {/* ✅ Display Reverse Geocoded Address */}
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                    <strong>Location:</strong> {address || "No location..."}
                </p>

                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                    Last Updated: {formattedDate}
                </p>

                {/* View Details Button */}
                <a href={`/product/${product.id}`} className="btn btn-success w-100">
                    View Details
                </a>
            </div>
        </div>
    );
};

export default ProductCard;
