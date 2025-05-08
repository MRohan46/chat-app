import { React, useState, useEffect } from 'react';
import "../components/style.css";
import BarsSVG from "../components/images/bars.svg"
import TimesSVG from "../components/images/times.svg"
import Logo from "../assets/logo.svg"
import loaderAnim from "../assets/loader-anim.gif"
import "../components/Cards/ProductCard.css"
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/Cards/ProductCard';

export default function Projects() {
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");

    const navigate = useNavigate();

    useEffect(() => {
        const handleLoad = () => setLoading(false);
        window.addEventListener("load", handleLoad);

        return () => window.removeEventListener("load", handleLoad);
    }, []);

    const toggleMenu = () => {
        setShowMenu(prevState => !prevState);
    };

    const handleTryClick = () => {
        navigate("/Chat");
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const multipleCategoryAIImageX = ["Websites", "AIaaS"];

    const products = [
        { title: "Chatlinx", description: `ChatLinx is a real-time messaging app designed for fast, secure, and interactive conversations. Featuring instant messaging, reactions, and an inline reply system similar to WhatsApp, ChatLinx keeps your conversations organized and engaging. With a sleek UI and real-time updates powered by React, Socket.io, and MongoDB, ChatLinx delivers a smooth and modern chat experience. Stay connected like never before!`, image: "https://i.ibb.co/RTCMmTsw/Generated-Image-March-26-2025-10-21-PM.jpg", category: "Websites", showButton: true },
        { title: "AIImageX", description: "AIImageX is a powerful AI-driven tool designed to create high-quality, stunning images instantly. Featuring advanced AI models, custom styles, and real-time rendering, AIImageX brings your imagination to life with just a few clicks. With a sleek UI and seamless experience powered by React, Gemini Flash 2.0, and Node.js, AIImageX makes AI-generated art accessible to everyone. Unleash your creativity like never before!", image: "https://i.ibb.co/qLHdHF81/Generated-Image-March-26-2025-10-30-PM.jpg", category: multipleCategoryAIImageX, showButton: true },
    ];

    const filteredProducts = !selectedCategory  // Handles null, undefined, and empty string
    ? null
    : selectedCategory === "All"
    ? products
    : products.filter(product => product.category.includes(selectedCategory));


    return (
        !loading ? (
            <>
                <div className="header">
                    <nav className={`nav container ${showMenu ? "showMenu" : ""}`}>
                        <h2 className="nav_logo"><a href="/"><img src={Logo} alt="Logo River Waves" /></a></h2>
                        <ul className="menu_items">
                            <img src={TimesSVG} alt="timesicon" id="menu_toggle" onClick={toggleMenu} />
                            <li><a href="/" className="nav_link">Home</a></li>
                            <li><a href="about" className="nav_link">About</a></li>
                            <li><a href="Services" className="nav_link">Services</a></li>
                            <li><a href="projects" className="nav_link active">Projects</a></li>
                            <li><a href="contact" className="nav_link">Contact</a></li>
                        </ul>
                        <img src={BarsSVG} alt="timesicon" id="menu_toggle" onClick={toggleMenu} />
                    </nav>
                </div>
                <div className="container">
                    <div className="sidebar">
                        <div className="filter">
                            <h3>Category</h3>
                            <select className="category-select" onChange={handleCategoryChange}>
                                <option>All</option>
                                <option>Websites</option>
                                <option>AIaaS</option>
                                <option>Home & Kitchen</option>
                            </select>
                        </div>
                    </div>
                    <div className="product-list" id="product-list">
                        {filteredProducts === null ? (
                            <p>null</p>  // Show "null" text when selectedCategory is null or undefined
                        ) : (
                            filteredProducts.length > 0 ? (
                                filteredProducts.map((product, index) => (
                                    <ProductCard
                                        key={index}
                                        title={product.title}
                                        description={product.description}
                                        image={product.image}
                                        onClick={handleTryClick}
                                        showButton={product.showButton}
                                    />
                                ))
                            ) : (
                                <ProductCard
                                    title="404 Not Found!"
                                    description="The Seleected Category Does not have any projects currently"
                                    image="https://img.freepik.com/free-vector/page-found-concept-illustration_114360-1869.jpg"
                                />
                            )
                        )}
                    </div>

                </div>
            </>
        ) : (
            <div className="loader">
                <img src={Logo} style={{ height: "8rem", marginBottom: "5%" }} alt="Logo River Waves" />
                <img src={loaderAnim} alt="Loader Gif" style={{ height: "0.5rem" }} />
            </div>
        )
    );
}
