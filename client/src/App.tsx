import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserProvider } from './context/UserContext';
//import RegisterForm from "./Components/RegisterForm";

const RegisterForm = lazy(() => import("./Components/RegisterForm"));
const LoginForm = lazy(() => import("./Components/LoginForm"));
const AddProduct = lazy(() => import("./Components/AddProduct"));
const ViewProducts = lazy(() => import("./Components/ViewProducts"));
const Navbar = lazy(() => import("./Components/Navbar"));
const Home = lazy(() => import("./Components/Home"));
const ViewProfile = lazy(() => import("./Components/ViewProfile"));
const ViewDetails = lazy(() => import("./Components/ViewDetails"));
const UpdateProfile = lazy(() => import("./Components/UpdateProfile"));
const ViewAddedProducts = lazy(() => import("./Components/ViewAddedProducts"));
const EditProduct = lazy(() => import("./Components/EditProduct"));
const ChatList = lazy(() => import("./Components/ChatList"));
const ChatWindow = lazy(() => import("./Components/ChatWindow"));

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (token && tokenExpiry) {
      const currentTime = new Date().getTime();

      if (currentTime > parseInt(tokenExpiry)) {
        setIsSessionExpired(true);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
        navigate("/session-expired");
      } else {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // or any other loading indicator
  }

  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col bg-red-100">
        <Suspense fallback={<div className="text-center text-lg">Loading...</div>}>
          <Navbar />
          <div className="flex flex-col justify-center items-center p-4">
            <Routes>
              {/* Public Routes */}
              {!isAuthenticated && !isSessionExpired && (
                <>
                  <Route path="/" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                </>
              )}

              {/* Session Expired Route */}
              {isSessionExpired && (
                <Route path="/session-expired" element={<div className="alert alert-danger">Session expired. Please log in again.</div>} />
              )}

              {/* Protected Routes */}
              {isAuthenticated && !isSessionExpired && (
                <>
                  <Route path="/home" element={<Home />} />
                  <Route path="/add-product" element={<AddProduct />} />
                  <Route path="/view-products" element={<ViewProducts />} />
                  <Route path="/view-profile" element={<ViewProfile />} />
                  <Route path="/product/:id" element={<ViewDetails />} />
                  <Route path="/update-profile" element={<UpdateProfile />} />
                  <Route path="/view-added-products" element={<ViewAddedProducts />} />
                  <Route path="/edit-products/:productId" element={<EditProduct />} />
                  <Route path="/chats" element={<ChatList />} />
                  <Route
                    path="/chats/:chatId"
                    element={
                      <ChatWindow
                        recipient={useLocation().state?.recipient}
                      />
                    }
                  />
                </>
              )}

              {/* Default Redirect to Login if no valid token */}
              {!isAuthenticated && !isSessionExpired && (
                <Route path="/*" element={<LoginForm />} />
              )}
            </Routes>
          </div>
        </Suspense>
      </div>
    </UserProvider>
  );
};

export default App;
