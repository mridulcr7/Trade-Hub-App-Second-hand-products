import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const RegisterForm = () => {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    const handlePasswordVisibility = () => {
        setPasswordVisible((prevState) => !prevState);
    };

    // ✅ Register API function
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

                setSuccessMessage("✅ register successfully!");
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
        <div className="container mt-5">
            <div className="card shadow-lg" style={{ maxWidth: "400px", margin: "0 auto" }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Register</h2>

                    {errorMessage && <p className="alert alert-danger text-center">{errorMessage}</p>}
                    {successMessage && <p className="text-success text-center">{successMessage}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input className="form-control" type="text" name="name" placeholder="Name" required />
                        </div>
                        <div className="mb-3">
                            <input className="form-control" type="email" name="email" placeholder="Email" required />
                        </div>
                        <div className="mb-3 position-relative">
                            <input className="form-control" type={passwordVisible ? "text" : "password"} name="password" placeholder="Password" required />
                            <span className="position-absolute top-50 end-0 translate-middle-y me-3" onClick={handlePasswordVisibility} style={{ cursor: "pointer" }}>
                                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="mb-3">
                            <input className="form-control" type="text" name="contact" placeholder="Contact (10 digits)" maxLength={10} required />
                        </div>
                        <div className="mb-3">
                            <input type="file" className="form-control" onChange={(e) => setImage(e.target.files?.[0] || null)} required />
                        </div>
                        <button type="submit" className="btn btn-success w-100" disabled={mutation.isPending}>
                            {mutation.isPending ? "Registering..." : "Register"}
                        </button>
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
