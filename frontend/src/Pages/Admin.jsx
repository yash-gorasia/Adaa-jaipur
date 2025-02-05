import { useState } from "react";
import React from "react";
import Sidebar from "../Components/AdminPage/Sidebar";
import Categories from "../Components/AdminPage/Categories";
import ProductPage from "../Components/AdminPage/Products";
import Subcategories from "../Components/AdminPage/Subcategories";
import Orders from "../Components/AdminPage/Order";
const AdminPage = () => {
    const [selected, setSelected] = useState("categories");

    const renderContent = () => {
        switch (selected) {
            case "categories":
                return <Categories />;
            case "products":
                return <ProductPage />;
            case "subcategories":
                return <Subcategories />;
            case "orders":
                return <Orders />;
            default:
                return <Categories />;
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="flex">
            <Sidebar onSelect={setSelected} />
            <div className="flex-1 bg-gray-100 h-screen">{renderContent()}</div>
        </div>
    );
};

export default AdminPage;
