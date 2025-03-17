import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

interface DecodedToken {
    id: string;
    email: string;
    iat: number;
    exp: number;
}

interface UserProfile {
    name: string;
    contact: string;
    image_url: string;
}

const fetchUserDetails = async (id: string): Promise<UserProfile> => {
    const response = await fetch("http://localhost:5000/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user details");
    }

    const data = await response.json();
    return data.user;
};

const updateProfile = async (formData: FormData) => {
    const response = await axios.put("http://localhost:5000/user/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });



    // if (!response.ok) {
    //     throw new Error("Failed to update profile");
    // }

    return response.data;
};

const UpdateProfile = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const decoded = token ? jwtDecode<DecodedToken>(token) : null;
    const userId = decoded?.id || "";

    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    const { data: user, isLoading, error } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: () => fetchUserDetails(userId),
        enabled: !!userId,
    });

    const mutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {

            setSuccessMessage("✅ Profile updated successfully!");
            navigate("/view-profile");
        },
        onError: (error: any) => {
            console.log(error)
            if (axios.isAxiosError(error)) {
                const backendMessage = error.response?.data?.message || "An unexpected error occurred.";
                setErrorMessage(`❌ ${backendMessage}`);
            } else {
                setErrorMessage("❌ Something went wrong. Please try again.");
            }
        },
    });

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [contactError, setContactError] = useState<string | null>(null);

    // Update state when user data is fetched
    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setContact(user.contact);
            setImagePreview(user.image_url);
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Allow only digits (no letters or special characters)
        if (!/^\d*$/.test(value)) return;

        setContact(value);

        // Check if the contact number is exactly 10 digits
        if (value.length !== 10) {
            setContactError("Contact number must be exactly 10 digits.");
        } else {
            setContactError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || contact.length !== 10) {
            setContactError("Contact number must be exactly 10 digits.");
            return;
        }

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("name", name);
        formData.append("contact", contact);
        if (image) formData.append("image", image);

        mutation.mutate(formData);
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error fetching user data</p>;

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-lg" style={{ width: "30rem" }}>
                <h3 className="text-center">Update Profile</h3>

                {errorMessage && <p className="alert alert-danger text-center">{errorMessage}</p>}
                {successMessage && <p className="text-success text-center">{successMessage}</p>}

                <div className="text-center mb-3">
                    <img
                        src={imagePreview || "default-profile.png"}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Contact</label>
                        <input
                            type="text"
                            className="form-control"
                            value={contact}
                            onChange={handleContactChange}
                            maxLength={10} // Prevents input of more than 10 characters
                            required
                        />
                        {contactError && <small className="text-danger">{contactError}</small>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Profile Image</label>
                        <input type="file" className="form-control" onChange={handleImageChange} />
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={mutation.isPending}>
                        {mutation.isPending ? "Updating..." : "Update Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;
