import { React, useState, useEffect, useRef } from 'react';
import "../components/style.css";
import BarsSVG from "../components/images/bars.svg"
import TimesSVG from "../components/images/times.svg"
import Logo from "../assets/logo.svg"
import loaderAnim from "../assets/loader-anim.gif"
import { ToastContainer, toast} from 'react-toastify';



export default function About(){
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const nameRef = useRef();
    const emailRef = useRef();
    const subjectRef = useRef();
    const messageRef = useRef();
    const [submitted, setSubmitted] = useState(false);
    const ToastOptions = {
        position: "top-right",
        autoClose: 8000,
        pauseOnHover: true,
        theme: "dark",
    }

    useEffect(() => {
        const handleLoad = () => setLoading(false);
        window.addEventListener("load", handleLoad);
    
        return () => window.removeEventListener("load", handleLoad);
    }, []);

    const toggleMenu = () => {
        setShowMenu(prevState => !prevState);
        
    };
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://smtpjs.com/v3/smtp.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const sendMail = () => {
        const name = nameRef.current.value.trim();
        const email = emailRef.current.value.trim();
        const subject = subjectRef.current.value.trim();
        const message = messageRef.current.value.trim();

        // Validation
        if (!name || !email || !subject || !message) {
            toast.warning("Please fill all details!", ToastOptions);
            return;
        }
        
        window.Email.send({
            Host : "smtp.elasticemail.com",
            Username : "rohanmuhammad1k@gmail.com",
            Password : "E825B1402F5B0DD4AC0D7D0538FDBBAF7792",
            To : 'rohanmuhammad222k@gmail.com',
            From : "rohanmuhammad1k@gmail.com",
            Subject : subject,
            Body: `
                    <b>New Contact Message</b><br/><br/>
                    <b>Name:</b> ${name}<br/>
                    <b>Email:</b> ${email}<br/>
                    <b>Subject:</b> ${subject}<br/>
                    <b>Message:</b><br/>${message}
                `
        }).then(
            (response) => {
              if (response === "OK") {
                setSubmitted(true);
              } else {
                toast.error("An error occurred while sending the message.", ToastOptions);
              }
            }
          );
        };
    
    return (
        !loading ? (
            <>
                <main>
                    <header>
                    <ToastContainer />
                        <nav className={`nav container ${showMenu ? "showMenu" : ""}`}>
                            <h2 className="nav_logo"><a href="/"><img src={Logo} alt="logo" /></a></h2>

                            <ul className="menu_items">
                                <img src={TimesSVG} alt="timesicon" id="menu_toggle" onClick={toggleMenu} />
                                <li><a href="/" className="nav_link">Home</a></li>
                                <li><a href="about" className="nav_link">About</a></li>
                                <li><a href="Services" className="nav_link">Services</a></li>
                                <li><a href="projects" className="nav_link">Projects</a></li>
                                <li><a href="" className="nav_link active">Contact</a></li>
                            </ul>
                            <img src={BarsSVG} alt="menuicon" id="menu_toggle" onClick={toggleMenu} />
                        </nav>
                    </header>

                    <section className="hero">
                        <div className="row container">
                            <div className="column">
                                <h2>River Waves Solutions</h2>
                            </div>
                                {/* Contact Form */}
                                {!submitted ? (
                                    <form className="contact_form" onSubmit={(e) => { e.preventDefault(); sendMail(); }}>
                                    <h3>Contact Us</h3>
                                    <div className="form_group">
                                        <label htmlFor="name">Name</label>
                                        <input type="text" id="name" ref={nameRef} placeholder="Your full name" />
                                    </div>
                                    <div className="form_group">
                                        <label htmlFor="email">Email</label>
                                        <input type="email" id="email" ref={emailRef} placeholder="you@example.com" />
                                    </div>
                                    <div className="form_group">
                                        <label htmlFor="subject">Subject</label>
                                        <input type="text" id="subject" ref={subjectRef} placeholder="What’s the topic?" />
                                    </div>
                                    <div className="form_group">
                                        <label htmlFor="message">Message</label>
                                        <textarea id="message" rows="5" ref={messageRef} placeholder="Write your message here..." />
                                    </div>
                                    <button type="submit" className="btn">Send Message</button>
                                    </form>
                                ) : (
                                    <div className="thank_you">
                                    <h3>Thanks for submitting the form</h3>
                                    <p>The team will contact you in a few moments.</p>
                                    </div>
                                )}
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