import { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaThList, FaBoxOpen, FaUserCircle, FaShoppingCart } from "react-icons/fa";

export default function Header({
    cartCount,
    onCartOpen,
    onCartClose,
    selectedVariant,
    onVariantChange,
    options,
    onSearch,
    cart
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeIndex, setActiveIndex] = useState(0);

    const navItems = [
        { id: 1, label: "Home", icon: <FaHome size={20} />, emoji: "🏠", path: "/home" },
        { id: 2, label: "Categories", icon: <FaThList size={18} />, emoji: "📂", path: "#" },
        { id: 3, label: "My Orders", icon: <FaBoxOpen size={20} />, emoji: "📦", path: "/orders" },
        { id: 4, label: "Cart", icon: <FaShoppingCart size={20} />, emoji: "🛒", path: null },
        { id: 5, label: "Profile", icon: <FaUserCircle size={20} />, emoji: "👤", path: "/profile" },
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const index = navItems.findIndex(item => item.path === currentPath);
        
        if (index !== -1) {
            setActiveIndex(index);
            if (onCartClose) onCartClose();
        }
    }, [location.pathname]);

    useEffect(() => {
        const currentPath = location.pathname;
        const index = navItems.findIndex(item => item.path === currentPath);
        if (index !== -1) setActiveIndex(index);
    }, [location.pathname]);

    const handleNavClick = (item, index) => {
        setActiveIndex(index);

        if (item.label !== "Cart" && onCartClose) {
            onCartClose();
        }

        if (item.label === "Cart") {
            onCartOpen();
        } else if (item.label === "Profile") {
            navigate("/profile");
        } else if (item.path && item.path !== "#") {
            navigate(item.path);
        }
    };

    return (
        <>
            <header className="shop-header">
                <div className="header-top">
                    <div className="header-right">
                        <nav className="nav-links">
                            {navItems.filter(i => i.label !== "Cart").map((item, idx) => (
                                <span
                                    key={item.id}
                                    className={`nav-icon-link ${activeIndex === (idx < 3 ? idx : idx + 1) ? 'active' : ''}`}
                                    onClick={() => handleNavClick(item, (idx < 3 ? idx : idx + 1))}
                                    title={item.label}
                                >
                                    {item.icon}
                                </span>
                            ))}
                        </nav>

                        <button className="cart-btn" onClick={onCartOpen}>
                            <FaShoppingCart size={18} />
                            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                        </button>
                    </div>
                </div>

                <div className="header-search">
                    <Select
                        className="variant-select"
                        placeholder="Search products..."
                        value={selectedVariant}
                        onChange={onVariantChange}
                        options={options}
                    />
                    <button className="search-btn" onClick={onSearch}>Search</button>
                </div>
            </header>

            <div className="mobile-bottom-nav">
                <div className="nav-content">
                    <div
                        className="nav-indicator"
                        style={{
                            width: `${100 / navItems.length}%`,
                            transform: `translateX(${activeIndex * 100}%)`,
                        }}
                    >
                        <div className="curve-cutout"></div>
                        <button className="floating-action-btn">
                            {navItems[activeIndex].emoji}
                            {navItems[activeIndex].label === "Cart" && cart.length > 0 && (
                                <span className="cart-badge-mini">{cart.length}</span>
                            )}
                        </button>
                    </div>

                    {navItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`nav-item ${activeIndex === index ? "active" : ""}`}
                            onClick={() => handleNavClick(item, index)}
                        >
                            <div className="icon-container">
                                <span className="icon">{item.emoji}</span>

                                {item.label === "Cart" && cartCount > 0 && (
                                    <span className="mobile-cart-badge">{cartCount}</span>
                                )}
                            </div>
                            <span className="label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}