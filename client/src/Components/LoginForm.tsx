import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import { jwtDecode } from "jwt-decode";

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/user/login", formData);
            const token = response.data.token;
            console.log(response);

            if (token) {
                // Decode the JWT to extract expiry time
                const decodedToken: any = jwtDecode(token);
                console.log(decodedToken);
                const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds

                // Store token and expiry
                console.log(expirationTime);
                localStorage.setItem("authToken", token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                localStorage.setItem("tokenExpiry", expirationTime.toString());

                alert("Login successful!");

                // Debugging: Check if navigate is being called
                console.log("Redirecting to /home...");
                navigate("/home");
            } else {
                alert("Invalid response from server.");
            }
        } catch (error) {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg" style={{ maxWidth: "400px", margin: "0 auto" }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                className="form-control"
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3 position-relative">
                            <input
                                className="form-control"
                                type={showPassword ? "text" : "password"} // Toggle input type based on showPassword state
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                required
                            />
                            {/* Eye icon to toggle password visibility */}
                            <div
                                className="position-absolute"
                                style={{ top: "10px", right: "10px", cursor: "pointer" }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-success w-100">Login</button>
                    </form>

                    <p className="text-center mt-3">
                        Don't have an account?{" "}
                        <a href="/register" className="text-decoration-none text-primary">
                            Sign Up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
