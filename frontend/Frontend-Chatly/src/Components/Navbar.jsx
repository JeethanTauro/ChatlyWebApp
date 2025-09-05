import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthService from '../Services/AuthService.js'


// our navbar has to be dynamic isnt it
// when we are logged out we have to see the sign in option
// when we are logged in then we have to show "Welcome <your name>" "Logout" "Chat Area">

function Navbar() {

    const navigate = useNavigate();
    const isAuthenticated = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();
    const handleLogout = async ()=>{
        try{
            await AuthService.logout();
            navigate("/login");

        }
        catch(error){
            console.error("logout failed");
            localStorage.clear();
            navigate("/login");
        }
    }


  return (
    <nav className='Navbar'>
        <div className='Navbar-Container'>
            <Link to={"/"} className='Navbar-Brand'>
                Chatly
            </Link>
            <div className='Navbar-Menu'>
                {isAuthenticated ? (
                    <>
                        <Link to={"/ChatArea"} className='Navbar-Link'>
                            Chat
                        </Link>
                        <div className='Navbar-Username'>
                            <span className='User-Info'>Welcome {currentUser.username}</span>
                        </div>
                        <button className='Logout' onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to={"/login"} className='Navbar-Link'>
                            Login
                        </Link>
                        <Link to={"/Signup"} className='Navbar-Link'>
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </div>
    </nav>
  );
}

export default Navbar
