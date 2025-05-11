import { React, useState, useEffect } from 'react';
import "../components/style.css";
import HeroImg from "../components/images/hero.png"
import BottomHero from "../components/images/bg-bottom-hero.png"
import BarsSVG from "../components/images/bars.svg"
import TimesSVG from "../components/images/times.svg"
import Logo from "../assets/logo.svg"
import loaderAnim from "../assets/loader-anim.gif"
import { FaExternalLinkAlt } from 'react-icons/fa';




export default function Index(){
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

    const navigateLink = () => {
        window.location.href = "https://www.linkedin.com/company/river-waves-solutions";
    }

    return (
        !loading ? (
            <>
                <main>
                    <header>
                        <nav className={`nav container ${showMenu ? "showMenu" : ""}`}>
                        <h2 className="nav_logo"><a href=""><img src={Logo}></img></a></h2>

                        <ul className="menu_items">
                            <img src={TimesSVG} alt="timesicon" id="menu_toggle"  onClick={toggleMenu} />
                            <li><a href="" className="nav_link active">Home</a></li>
                            <li><a href="About" className="nav_link">About</a></li>
                            <li><a href="services" className="nav_link">Services</a></li>
                            <li><a href="projects" className="nav_link">Projects</a></li>
                            <li><a href="contact" className="nav_link">Contact</a></li>
                        </ul>
                        <img src={BarsSVG} alt="timesicon" id="menu_toggle"  onClick={toggleMenu} />
                        </nav>
                    </header>
                    <section className="hero">
                        <div className="row container">
                        <div className="column">
                            <h2>Your Partner in Digital Success</h2>
                            <p>At River Waves Solutions, we offer professional digital solutions to fit your business. With experienced personnel and years of expertise, we offer development, marketing, design, and IT services to create growth. Emphasizing innovation and quality, we bring ideas to life for enduring success.</p>
                            <div className="buttons">
                                <button className="btn">Get Started</button>
                                <button className="btn" onClick={navigateLink}>LinkedIn &nbsp; <FaExternalLinkAlt /></button>
                            </div>
                        </div>
                        <div className="column">
                            <img src={HeroImg} alt="heroImg" className="hero_img" />
                        </div>
                        </div>
                        <img src={BottomHero} alt="BottomHeroImg" className="curveImg" />
                    </section>
                </main>
            </>
        ) : <div className="loader">
                <img src={Logo} style={{height: "8rem", marginBottom: "5%"}}></img>
                <img src={loaderAnim} alt="" style={{height: "0.5rem"}} />
            </div>
    )
}