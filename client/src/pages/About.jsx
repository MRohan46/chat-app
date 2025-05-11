import { React, useState, useEffect } from 'react';
import "../components/style.css";
import BarsSVG from "../components/images/bars.svg"
import TimesSVG from "../components/images/times.svg"
import Logo from "../assets/logo.svg"
import loaderAnim from "../assets/loader-anim.gif"


export default function About(){
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleLoad = () => setLoading(false);
        window.addEventListener("load", handleLoad);
    
        return () => window.removeEventListener("load", handleLoad);
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
                            <li><a href="" className="nav_link active">About</a></li>
                            <li><a href="Services" className="nav_link">Services</a></li>
                            <li><a href="projects" className="nav_link">Projects</a></li>
                            <li><a href="contact" className="nav_link">Contact</a></li>
                        </ul>
                        <img src={BarsSVG} alt="timesicon" id="menu_toggle"  onClick={toggleMenu} />
                        </nav>
                    </header>
                    <section className="hero">
                        <div className="row container">
                            <div className="column">
                                <h2>River Waves Solutions</h2>
                            </div>
                            <div>

                                <p>At River Waves Solutions, we are your go-to source for a full range of digital services. With over 18 years of experience, our team includes a skilled Data Entry professional who has worked with Etisalat and an IT expert with more than 8 years of tackling complex challenges. We specialize in custom web development, including MERN stack, PHP, Shopify, and Amazon solutions, as well as eCommerce development and digital marketing to help businesses reach their objectives.</p>
                                    <br />
                                <p>Our offerings extend to graphic design, guest posting, IT solutions, social media management, and UI/UX design to create smooth user experiences. We excel in search engine optimization (SEO) to enhance online visibility and provide cloud solutions for improved scalability. Our services also include content creation, cybersecurity to protect your digital presence, and expert branding and identity design. Furthermore, we focus on digital accessibility and database management, ensuring accuracy and inclusivity in every project we handle.</p>
                                    <br />
                                <p>At River Waves Solutions, we blend creativity, technology, and strategy to deliver customized solutions that empower your business. From the initial idea to final execution, we are dedicated to helping you succeed in today’s competitive digital environment.</p>
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