import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // For eye icon

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        contact: "",
    });
    const [image, setImage] = useState<File | null>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState(""); // To store error message

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]);
        }
    };

    const handlePasswordVisibility = () => {
        setPasswordVisible((prevState) => !prevState); // Toggle visibility
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(""); // Clear any previous error message

        // Validate contact number
        if (formData.contact.length !== 10) {
            setErrorMessage("Contact number must be 10 digits.");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("contact", formData.contact);

        if (image) {
            formDataToSend.append("image", image); // Append image file
        }

        try {
            const response = await axios.post("http://localhost:5000/user/register", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const token = response.data.token;

            if (token) {
                // Decode the JWT to extract expiry time
                const decodedToken: any = jwtDecode(token);
                const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds

                // Store token and expiry
                localStorage.setItem("authToken", token);
                localStorage.setItem("tokenExpiry", expirationTime.toString());

                alert("register successful!");
                navigate("/home");
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || "Error registering user");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg" style={{ maxWidth: "400px", margin: "0 auto" }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Register</h2>

                    {/* Display error message */}
                    {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                className="form-control"
                                type="text"
                                name="name"
                                placeholder="Name"
                                onChange={handleChange}
                                required
                            />
                        </div>
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
                                type={passwordVisible ? "text" : "password"} // Toggle password visibility
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                required
                            />
                            <span
                                className="position-absolute top-50 end-0 translate-middle-y me-3"
                                onClick={handlePasswordVisibility}
                                style={{ cursor: "pointer" }}
                            >
                                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="mb-3">
                            <input
                                className="form-control"
                                type="text"
                                name="contact"
                                placeholder="Contact (10 digits)"
                                onChange={handleChange}
                                maxLength={10}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="file"
                                className="form-control"
                                onChange={handleImageChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-success w-100">Register</button>
                    </form>
                    <p className="text-center mt-3">
                        Already have an account?{" "}
                        <a href="/" className="text-decoration-none text-primary">
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
