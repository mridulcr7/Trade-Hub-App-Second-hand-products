import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const RegisterForm = () => {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    const handlePasswordVisibility = () => {
        setPasswordVisible((prevState) => !prevState);
    };

    const registerapi = async (formDataToSend: FormData) => {
        const response = await axios.post("http://localhost:5000/user/register", formDataToSend, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    };

    const mutation = useMutation({
        mutationFn: registerapi,
        mutationKey: ["register"],
        onSuccess: (data) => {
            const token = data.token;

            if (token) {
                const decodedToken: any = jwtDecode(token);
                const expirationTime = decodedToken.exp * 1000;

                localStorage.setItem("authToken", token);
                localStorage.setItem("tokenExpiry", expirationTime.toString());

                setSuccessMessage("✅ Registered successfully!");
                navigate("/home");
            }
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        if (formData.get("contact")?.toString().length !== 10) {
            return;
        }

        if (image) {
            formData.append("image", image);
        }

        mutation.mutate(formData);
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ maxWidth: "450px", width: "100%" }}>
                <div className="card-body">
                    <h2 className="card-title text-center fw-bold mb-4" style={{ color: "#9279D2" }}>
                        Register
                    </h2>

                    {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
                    {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input className="form-control" type="text" name="name" placeholder="Full Name" required />
                        </div>

                        <div className="mb-3">
                            <input className="form-control" type="email" name="email" placeholder="Email" required />
                        </div>

                        <div className="mb-3 position-relative">
                            <input
                                className="form-control"
                                type={passwordVisible ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                required
                            />
                            <span
                                className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                                onClick={handlePasswordVisibility}
                                style={{ cursor: "pointer" }}
                            >
                                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <div className="mb-3">
                            <input className="form-control" type="text" name="contact" placeholder="Contact (10 digits)" maxLength={10} required />
                        </div>

                        <div className="mb-3">
                            <input type="file" className="form-control" onChange={(e) => setImage(e.target.files?.[0] || null)} required />
                        </div>

                        <button
                            type="submit"
                            className="btn w-100 fw-bold"
                            style={{ backgroundColor: "#9279D2", color: "white" }}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? "Registering..." : "Register"}
                        </button>
                    </form>

                    <p className="text-center mt-3">
                        Already have an account?{" "}
                        <a href="/" className="text-decoration-none fw-bold" style={{ color: "#C88BE8" }}>
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
