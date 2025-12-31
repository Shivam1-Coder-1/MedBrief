import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import "../Style/layout.css"; 

const Layout = () => {
  return (
    <div className="medbrief-layout-wrapper">
      <Navbar />
      <main className="medbrief-main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;