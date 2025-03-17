import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import { jwtDecode } from "jwt-decode";
import { useMutation } from "@tanstack/react-query";


const LoginForm = () => {


    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const logindata = async (formData: { email: string; password: string }) => {
        const response = await axios.post("http://localhost:5000/user/login", formData);
        return response.data

    }


    const mutation = useMutation(
        {
            mutationFn: logindata,
            onSuccess: (data) => {
                console.log(data)
                const token = data.token;


                if (token) {
                    // Decode the JWT to extract expiry time
                    const decodedToken: any = jwtDecode(token);
                    console.log(decodedToken);
                    const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds

                    // Store token and expiry
                    console.log(expirationTime);
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    localStorage.setItem("tokenExpiry", expirationTime.toString());

                    setSuccessMessage("✅ login successfully!");

                    // Debugging: Check if navigate is being called
                    console.log("Redirecting to /home...");
                    navigate("/home");
                } else {
                    alert("Invalid response from server.");
                }

                // localStorage.setItem("authToken", data.token);
                // localStorage.setItem("user", JSON.stringify(data.user));
                // navigate("/home");
            },
            onError: (error: any) => {

                if (axios.isAxiosError(error)) {
                    const backendMessage = error.response?.data?.message || "An unexpected error occurred.";
                    setErrorMessage(`❌ ${backendMessage}`);
                } else {
                    setErrorMessage("❌ Something went wrong. Please try again.");
                }
            },
        })



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);


    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg" style={{ maxWidth: "400px", margin: "0 auto" }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Login</h2>

                    {errorMessage && <p className="alert alert-danger text-center">{errorMessage}</p>}
                    {successMessage && <p className="text-success text-center">{successMessage}</p>}

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

                        <button type="submit" className="btn btn-success w-100" disabled={mutation.isPending}>
                            {mutation.isPending ? "signing in..." : "Login"}
                        </button>

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
