// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap styles
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
// import "./index.css"; // If you have any custom styles

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );


import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom"; // Make sure this import is here

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <BrowserRouter>  {/* This should wrap your entire app */}
    <App />
  </BrowserRouter>
);
