import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaPlus, FaUser, FaEnvelope } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {

        const expiry = localStorage.getItem("tokenExpiry");
        const token = localStorage.getItem("authToken");

        if (token && expiry) {
            const currentTime = new Date().getTime();
            if (currentTime > parseInt(expiry, 10)) {

                localStorage.removeItem("authToken");
                localStorage.removeItem("tokenExpiry");
                setIsLoggedIn(false);
                navigate("/");
            } else {
                setIsLoggedIn(true);
            }
        } else {
            setIsLoggedIn(false);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiry");
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg shadow" style={{ backgroundColor: "#9279D2" }}>
            <div className="container">
                <Link
                    to="/home"
                    className="navbar-brand fw-bold fs-4"
                    style={{ color: "white", textDecoration: "none" }}
                >
                    MyStore
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {!isLoggedIn ? (
                            <>
                                <li className="nav-item">
                                    <Link to="/" className="nav-link text-white fw-semibold">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/register" className="nav-link text-white fw-semibold">
                                        Register
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>

                                <li className="nav-item me-5">
                                    <Link to="/add-product" className="nav-link d-flex align-items-center text-white fw-semibold">
                                        <div
                                            className="d-flex align-items-center justify-content-center"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                backgroundColor: "#fff",
                                                borderRadius: "50%",
                                                marginRight: "8px",
                                            }}
                                        >
                                            <FaPlus style={{ color: "#9279D2", fontSize: "18px" }} />
                                        </div>
                                        Add Product
                                    </Link>
                                </li>
                                <li className="nav-item me-5">
                                    <Link to="/chats" className="nav-link d-flex align-items-center text-white fw-semibold">
                                        <div
                                            className="d-flex align-items-center justify-content-center"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                backgroundColor: "#fff",
                                                borderRadius: "50%",
                                                marginRight: "8px",
                                            }}
                                        >
                                            <FaEnvelope style={{ color: "#9279D2", fontSize: "18px" }} />
                                        </div>
                                        View Chats
                                    </Link>
                                </li>


                                <li
                                    className="nav-item dropdown me-5"
                                    style={{ cursor: "pointer", position: "relative" }}
                                    onMouseEnter={() => setIsDropdownOpen(true)}
                                    onMouseLeave={() => setIsDropdownOpen(false)}
                                >
                                    <div className="nav-link text-white fw-semibold d-flex align-items-center">
                                        <FaUser className="me-1" />
                                        View Profile
                                    </div>


                                    {isDropdownOpen && (
                                        <ul
                                            className="dropdown-menu show"
                                            style={{
                                                display: "block",
                                                position: "absolute",
                                                top: "100%",
                                                left: "0",
                                                backgroundColor: "#fff",
                                                borderRadius: "8px",
                                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                                padding: "10px",
                                                zIndex: 1000,
                                                minWidth: "180px",
                                            }}
                                        >
                                            <li>
                                                <Link
                                                    className="dropdown-item"
                                                    to="/update-profile"
                                                    style={{
                                                        padding: "10px",
                                                        transition: "background 0.3s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        const target = e.target as HTMLAnchorElement; // Typecast to HTMLAnchorElement
                                                        target.style.backgroundColor = "#f0f0f0";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        const target = e.target as HTMLAnchorElement; // Typecast to HTMLAnchorElement
                                                        target.style.backgroundColor = "transparent";
                                                    }}
                                                >
                                                    Update Profile
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    className="dropdown-item"
                                                    to="/view-profile"
                                                    style={{
                                                        padding: "10px",
                                                        transition: "background 0.3s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        const target = e.target as HTMLAnchorElement; // Typecast to HTMLAnchorElement
                                                        target.style.backgroundColor = "#f0f0f0";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        const target = e.target as HTMLAnchorElement; // Typecast to HTMLAnchorElement
                                                        target.style.backgroundColor = "transparent";
                                                    }}
                                                >
                                                    View Profile
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    className="dropdown-item"
                                                    to="/view-added-products"
                                                    style={{
                                                        padding: "10px",
                                                        transition: "background 0.3s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        const target = e.target as HTMLAnchorElement; // Typecast to HTMLAnchorElement
                                                        target.style.backgroundColor = "#f0f0f0";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        const target = e.target as HTMLAnchorElement; // Typecast to HTMLAnchorElement
                                                        target.style.backgroundColor = "transparent";
                                                    }}
                                                >
                                                    View Added Products
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>


                                <li className="nav-item ms-auto">
                                    <button
                                        className="btn text-white fw-semibold"

                                        onClick={handleLogout}
                                        style={{ backgroundColor: "#D72638", padding: "8px 15px", marginLeft: "30px" }}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
