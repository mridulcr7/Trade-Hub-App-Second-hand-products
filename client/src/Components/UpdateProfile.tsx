import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    id: string;
    email: string;
    iat: number;
    exp: number;
}

const UpdateProfile = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            const decoded = jwtDecode<DecodedToken>(token);
            setUserId(decoded.id);
            fetchUserDetails(decoded.id);
        }
    }, []);

    const fetchUserDetails = async (id: string) => {
        try {
            const response = await fetch("http://localhost:5000/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user details");
            }

            const data = await response.json();
            setName(data.user.name);
            setContact(data.user.contact);
            setImagePreview(data.user.image_url);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("name", name);
        formData.append("contact", contact);
        if (image) formData.append("image", image);

        try {
            const response = await fetch("http://localhost:5000/user/profile", {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            alert("Profile updated successfully!");
            navigate("/view-profile");
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-lg" style={{ width: "30rem" }}>
                <h3 className="text-center">Update Profile</h3>

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
                            onChange={(e) => setContact(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Profile Image</label>
                        <input type="file" className="form-control" onChange={handleImageChange} />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Update Profile</button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;
