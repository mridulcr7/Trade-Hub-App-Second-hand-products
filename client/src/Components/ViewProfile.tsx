import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    id: string;
    email: string;
    iat: number;
    exp: number;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    contact: string;
    image_url: string;
}

// Function to fetch user data
const fetchUserProfile = async (): Promise<UserProfile> => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No token found");

    const decoded = jwtDecode<DecodedToken>(token);
    const id = decoded.id;

    const response = await fetch("http://localhost:5000/user/profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user data");
    }

    const data = await response.json();
    if (!data.user) throw new Error("User data not found");

    return data.user;
};

const ViewProfile = () => {
    const { data: user, isLoading, error } = useQuery(
        {
            queryKey: ["userProfile"],
            queryFn: fetchUserProfile
        });

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <p>Loading...</p>
            </div>
        );
    }

    if (error instanceof Error) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <p className="text-danger">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center mt-5">
            {user && (
                <div className="card shadow-lg p-4 text-center" style={{ width: "22rem" }}>
                    {/* User Profile Image */}
                    <div className="d-flex justify-content-center mb-4">
                        <img
                            src={user.image_url}
                            alt="Profile"
                            className="rounded-circle shadow border-5 border-white"
                            style={{ width: "150px", height: "150px", objectFit: "cover" }}
                        />
                    </div>

                    <h3 className="text-dark mt-2">{user.name}</h3>
                    <p className="text-muted mb-1">📧 {user.email}</p>
                    <p className="text-muted mb-2">📞 {user.contact}</p>

                    <Link to="/update-profile">
                        <button className="btn btn-primary mt-4 px-5 py-2 shadow" style={{ backgroundColor: "#9279D2", color: "white", width: "100%" }}>
                            Update Profile
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ViewProfile;
