import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    id: string;
    email: string;
    iat: number;
    exp: number;
}

const ViewProfile = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    console.error("No token found");
                    return;
                }

                // Decode token to extract email
                const decoded = jwtDecode<DecodedToken>(token);
                //  console.log("Decoded token:", decoded);

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
                // console.log("API response:", data);
                if (data.user) {
                    setUser(data.user); // Assuming data.user is the structure returned
                } else {
                    console.error("User data not found in the response.");
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    // Check if user data is available before rendering
    return (
        <div className="d-flex justify-content-center align-items-center mt-5">
            {user ? (
                <div className="card shadow-lg p-4 text-center" style={{ width: "22rem" }}>
                    {/* User Profile Image */}
                    <div className="d-flex justify-content-center mb-4">
                        <img
                            src={user.image_url} // Ensure backend sends this URL
                            alt="Profile"
                            className="rounded-circle shadow border-5 border-white"
                            style={{ width: "150px", height: "150px", objectFit: "cover" }}
                        />
                    </div>

                    <h3 className="text-dark mt-2">{user.name}</h3>
                    <p className="text-muted mb-1">📧 {user.email}</p>
                    <p className="text-muted mb-2">📞 {user.contact}</p>

                    <Link to="/update-profile">
                        <button className="btn btn-primary mt-4 px-5 py-2 shadow" style={{ backgroundColor: "#621940" }}>
                            Update Profile
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <p>Loading...</p>
                </div>
            )}
        </div>
    );
};

export default ViewProfile;
