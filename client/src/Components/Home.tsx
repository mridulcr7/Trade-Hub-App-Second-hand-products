import { useState } from "react";
import axios from "axios";
import useGeolocation from "../Hooks/useGeoLocation";
import ProductCard from "./ProductCard"; // Import ProductCard component
import { FaSearch } from "react-icons/fa"; // Import search icon
import { jwtDecode } from "jwt-decode"; // Import jwt-decode to decode the token

const states = ["Andhra Pradesh", "Bihar", "Delhi", "Karnataka", "Maharashtra", "Uttar Pradesh"];
const categories = ["Car", "Bike", "Mobile", "Furniture", "Laptop"];

const Home = () => {
    const { location } = useGeolocation();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [selectedState, setSelectedState] = useState("");

    console.log(localStorage.getItem("user"));

    const handleSearch = async () => {
        const requestData: any = {};

        // Get the userId from authToken in localStorage
        const token = localStorage.getItem("authToken");
        if (token) {
            const decodedToken: any = jwtDecode(token); // Decode the token
            requestData.userId = decodedToken.id; // Assuming the userId is stored as 'id' in the token
        }

        if (category) requestData.category = category;
        if (selectedState) requestData.state = selectedState; // Send selected state to backend
        if (location) {
            requestData.lat = location.latitude;
            requestData.long = location.longitude; // Fixed: use longitude correctly
        }

        try {
            const response = await axios.post("http://localhost:5000/product/get-products", requestData);
            setProducts(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row align-items-center mb-4">
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

                {/* Combined Category & Search in the same div */}
                <div className="col-md-4 mb-3 d-flex align-items-center">
                    <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: "70%" }} // Set the width of the select element
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Search button with icon */}
                    <button
                        className="btn btn-success ms-2"
                        onClick={handleSearch}
                        style={{ width: "30%" }} // Set the width of the button
                    >
                        <FaSearch />
                    </button>
                </div>
            </div>

            {/* Display Products */}
            <div className="row mt-4">
                {products.length > 0 ? (
                    products.map((product) => <ProductCard key={product.id} product={product} />)
                ) : (
                    <p>No products found</p>
                )}
            </div>
        </div>
    );
};

export default Home;
