import { API_BASE_URL } from "../config/api";

const Logout = () => {
    const handleLogout = async () => {
        try {
            const res = await fetch(`${ API_BASE_URL } /logout/`, {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Logout failed");
            }

            const data = await res.json();

            if (data.success) {
                toast.error("Logged out");
                window.location.href = "/Login";
            } else {
                toast.error(data.msg || "Logout error");
            }
        } catch (err) {
            toast.error("Server not reachable");
        }
    };

    return <button className="Logout-btn" onClick={handleLogout}>Logout</button>;
};

export default Logout;
