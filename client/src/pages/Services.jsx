import { React, useState, useEffect } from 'react';
import "../components/style.css";
import BarsSVG from "../components/images/bars.svg"
import TimesSVG from "../components/images/times.svg"
import Logo from "../assets/logo.svg"
import loaderAnim from "../assets/loader-anim.gif"
import Card from "../components/Cards/Card"


export default function About(){
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleLoad = () => setLoading(false);
        
        // Run immediately if the DOM is already loaded
        if (document.readyState === "complete" || document.readyState === "interactive") {
            handleLoad();
        } else {
            window.addEventListener("DOMContentLoaded", handleLoad);
            window.addEventListener("load", handleLoad); // Fallback for older browsers
        }

        return () => {
            window.removeEventListener("DOMContentLoaded", handleLoad);
            window.removeEventListener("load", handleLoad);
        };
    }, []);

    const toggleMenu = () => {
        setShowMenu(prevState => !prevState);
        
    };

    return (
        !loading ? (
            <>
                <main>
                    <header>
                        <nav className={`nav container ${showMenu ? "showMenu" : ""}`}>
                        <h2 className="nav_logo"><a href="/"><img src={Logo}></img></a></h2>

                        <ul className="menu_items">
                            <img src={TimesSVG} alt="timesicon" id="menu_toggle"  onClick={toggleMenu} />
                            <li><a href="/" className="nav_link">Home</a></li>
                            <li><a href="about" className="nav_link">About</a></li>
                            <li><a href="" className="nav_link active">Services</a></li>
                            <li><a href="projects" className="nav_link">Projects</a></li>
                            <li><a href="contact" className="nav_link">Contact</a></li>
                        </ul>
                        <img src={BarsSVG} alt="timesicon" id="menu_toggle"  onClick={toggleMenu} />
                        </nav>
                    </header>
                    <section className="hero">
                        <div className="row container">
                            <div className="column"></div>
                            <div className="cards">
                                <h2>Services</h2>
                                <Card
                                    title="Expert SEO Services"
                                    description="We help businesses rank higher on Google, drive organic traffic, and increase online visibility with cutting-edge SEO strategies. From keyword research to on-page optimization and technical SEO, we ensure your website stays ahead of the competition."
                                    image="https://i.ibb.co/5gZ8XXkG/Generated-Image-March-26-2025-9-34-PM.jpg"
                                />
                                <Card
                                    title="Website Development"
                                    description="We design and develop high-quality, responsive, and fast-loading websites tailored to your business needs. Whether you need a business website, e-commerce store, or a custom web application, we have got you covered!"
                                    image="https://i.ibb.co/9mTCG1DL/Generated-Image-March-26-2025-9-32-PM-1.jpg"
                                />
                            </div>
                            <div className="cards">
                                <br />
                                <br />
                                <br />
                                <Card
                                    title="AIaaS Integration"
                                    description="Leverage the power of Artificial Intelligence in your website with seamless AIaaS (AI-as-a-Service) integration! By using cutting-edge AI APIs like OpenAI, Google AI, and IBM Watson, we bring automation, personalization, and intelligence to your digital platform."
                                    image="https://i.ibb.co/SwXsYmyX/Generated-Image-March-26-2025-9-27-PM.jpg"
                                />
                                <Card
                                    title="Graphic Designing"
                                    description="Elevate your brand with stunning, professional, and eye-catching designs! Our expert designers craft logos, social media graphics, marketing materials, and UI/UX designs that leave a lasting impression."
                                    image="https://i.ibb.co/B5YM1DYD/Generated-Image-March-26-2025-9-32-PM.jpg"
                                />
                            </div>
                        </div>
                    </section>
                </main>
            </>

        ) : <div className="loader">
                <img src={Logo} style={{height: "8rem", marginBottom: "5%"}}></img>
                <img src={loaderAnim} alt="" style={{height: "0.5rem"}} />
            </div>
    )


}