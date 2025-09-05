import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import AuthService from '../Services/AuthService.js'

export default function Signup() {
        const[username  , setUsername]   =  useState('');
        const[password  , setPassword]   =  useState('');
        const[email  , setEmail]   =  useState('');
        const[message, setMessage] = useState('');
        const[isLoading , setIsLoading] = useState(false);
        const navigate = useNavigate();
        const handleSignup = async(e)=>{
            e.preventDefault();
            setMessage('');
            setIsLoading(true);
            try{
                const result = await AuthService.signup(username, email, password);
                if(result.success){
                    setMessage("Account created successfully !! Please Login now");
                }
                setTimeout(()=>{
                    navigate('/login');
                },2000);
            }
            catch(error){
                setMessage(error.message || 'Signup failed, Pleas try again');
                console.error('Sign up failes'+error);
                
            }
            finally{
                setIsLoading(false);
            }

        }
  return (
    <div className='signup-container'>
        <div className='signup-box'>
            <div className='signup-header'>
                <h1>Sign Up</h1>
                <p>Create account to start chatting</p>
            </div>
            <form onSubmit={handleSignup} className='signup-form'>
                <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e)=>setUsername(e.target.value)}
                maxLength={20}
                required
                disabled={isLoading}
                className='user-input'
                />

                <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e)=>setEmail(e.target.value)}
                maxLength={100}
                required
                disabled={isLoading}
                className='user-input'
                />

                <input 
                type="password" 
                placeholder="password" 
                value={password} 
                onChange={(e)=>setPassword(e.target.value)}
                minLength={8}
                required
                disabled={isLoading}
                className='user-input'
                />
                <button type='submit' 
                        disabled={!username.trim() || !email.trim() || !password.trim() || isLoading}
                        className='Join-Button'>
                            {isLoading ? 'Creating Account...' :  'Signup'}
                </button>

                {message && (
                    <p className='AuthMessage'
                       style={{color:message.includes('successfully') ? 'lightgreen' : '#ff6b6b'  }}
                    >
                        {message}
                    </p>
                )
                }
            </form>
        </div>
    </div>
  )
}
