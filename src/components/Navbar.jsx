import React from 'react'
import './style/navbar.css'

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg bg-light">

            <div className="container-fluid">

                <a className="navbar-brand" href="#">Baby Care</a>

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

                        <li className="nav-item">
                            <a className="nav-link">Home</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link">Features</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link">Doctors</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link">Resources</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link">Contact</a>
                        </li>

                        <li className="nav-item ms-lg-3">
                            <a className="btn btn-outline-primary">Login</a>
                        </li>

                        <li className="nav-item ms-lg-2">
                            <a className="btn btn-primary">Register</a>
                        </li>

                    </ul>

                </div>

            </div>

        </nav>
    )
}

export default Navbar