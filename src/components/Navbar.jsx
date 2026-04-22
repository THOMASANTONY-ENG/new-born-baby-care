import React from 'react'
import './style/navbar.css'
import { Link, useNavigate } from 'react-router-dom'
import { getLoggedInUser, logoutLoggedInUser } from '../utils/navigation'
const Navbar = () => {
    const navigate = useNavigate()
    const loggedInUser = getLoggedInUser()

    const handleLogout = () => {
        logoutLoggedInUser()
        navigate('/')
    }
    const navLinks = [
        { label: 'Home', to: '/' },
        { label: 'Features', to: '/#features' },
        { label: 'Doctors', to: '/#pediatricians' },
        { label: 'Resources', to: '/#education' },
        { label: 'About', to: '/about' },
        { label: 'Contact', to: '/#contact' },
    ]

    return (
        <nav className="navbar navbar-expand-lg homepage-navbar">

            <div className="container">

                <Link className="navbar-brand" to="/">
                    <span className="brand-mark">BB</span>
                    <span className="brand-text">BabyBloom</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarMenu"
                    aria-controls="navbarMenu"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarMenu">

                    <ul className="navbar-nav ms-auto">

                        {navLinks.map((item) => (
                            <li className="nav-item" key={item.label}>
                                <Link className="nav-link" to={item.to}>{item.label}</Link>
                            </li>
                        ))}

                        {!loggedInUser ? (
                            <>
                                <li className="nav-item ms-lg-3">
                                    <Link className="btn btn-outline-primary nav-cta secondary" to="/login">Login</Link>
                                </li>
                                <li className="nav-item ms-lg-2">
                                    <Link className="btn btn-primary nav-cta" to="/register">Register</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item ms-lg-3">
                                    <Link className="btn btn-outline-primary nav-cta secondary" to="/dashboard">Dashboard</Link>
                                </li>
                                <li className="nav-item ms-lg-2">
                                    <button className="btn btn-primary nav-cta" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        )}

                    </ul>

                </div>

            </div>

        </nav>
    )
}

export default Navbar
