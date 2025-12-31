import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Demo from "./Pages/Demo";
import Layout from "./Components/Layout";

import Home from "./Pages/Home";
import Reports from "./Pages/Reports";
import Smart_help from "./Pages/Smart_help";
import Intro from "./Pages/Intro";
import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Signup";
import Help from "./Pages/Help";
import CreateProfile from "./Services/Profile/Profile_Create";
import ReportSummary from "./Pages/ReportSummary";
import ProfileView from "./Components/ProfileView";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/Home", element: <Home /> },
      { path: "/Reports", element: <Reports /> },
      { path: "/SmartHelper", element: <Smart_help /> },
      { path: "/Help", element: <Help /> },
      { path: "/Upload", element: <ReportSummary /> },
      { path: "/Profile", element: <ProfileView /> },
    ],
  },

  { path: "/", element: <Intro /> },
  { path: "/Login", element: <Login /> },
  { path: "/Signup", element: <Signup /> },
  { path: "/Profile_create", element: <CreateProfile /> },
  { path: "/Demo", element: <Demo /> },
]);

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      <RouterProvider router={router} />
    </>
  );
}

export default App;