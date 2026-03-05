import React from 'react'
import './style/navbar.css'

const navbar = () => {
    return (
        <div className='navbar'>
            <h2> baby care</h2>
            <ul className='nav-list'>
                <li>Home</li>
                <li>Features</li>
                <li>Doctors</li>
                <li>Resources</li>
                <li>Contact</li>
                <li>Login</li>
                <li>Register</li>
            </ul>

        </div>
    )
}

export default navbar