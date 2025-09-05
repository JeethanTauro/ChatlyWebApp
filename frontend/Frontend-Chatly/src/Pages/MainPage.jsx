import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function MainPage() {

    const navigate = useNavigate();

    const handleGettingStarted = ()=>{
        navigate('/signup');
    }

  return (
    <div className='mainpage-container'>
        <h1 className='mainpage-title'>Welcome to Chatly</h1>
        <div className='mainpage-button'>
            <button
                className='btn btn-primary'
                onClick={handleGettingStarted}
                >
                    Getting Started
                </button>
        </div>
      
    </div>
  )
}
