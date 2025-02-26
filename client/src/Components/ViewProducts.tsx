import { useState, useEffect } from "react";

const ViewProducts = () => {
    const [products, setProducts] = useState<{ id: number; name: string; price: number }[]>([]);

    useEffect(() => {
        // Fetch products from an API (dummy data for now)
        setProducts([
            { id: 1, name: "Laptop", price: 800 },
            { id: 2, name: "Phone", price: 500 },
        ]);
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Products</h2>
            <ul>
                {products.map((product) => (
                    <li key={product.id} className="border p-2 mb-2">
                        {product.name} - ${product.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ViewProducts;
