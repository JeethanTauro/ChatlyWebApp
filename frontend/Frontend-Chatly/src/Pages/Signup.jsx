import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Signup() {
        const[username  , setUsername]   =  useState('');
        const[password  , setPassword]   =  useState('');
        const[email  , setEmail]   =  useState('');
        const[message, setMessage] = useState('');
        const[isLoading , setIsLoading] = useState(false);
        const navigate = useNavigate();
        handleSignup = async(e)=>{
            e.preventDefault();
            setMessage('');
            setIsLoading(true);
            try{
                const result = await authservice.signup(username, email, password);
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
    <div className='Signup-Container'>
        <div className='Signup-Box'>
            <div className='Signup-Header'>
                <h1>Sign Up</h1>
                <p>Create account to start chatting</p>
            </div>
            <form onSubmit={handleSignup} className='Signup-Form'>
                <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e)=>setUsername(e.target.value)}
                maxLength={20}
                required
                disabled={isLoading}
                className='User-Input'
                />

                <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e)=>setEmail(e.target.value)}
                maxLength={40}
                required
                disabled={isLoading}
                className='User-Input'
                />

                <input 
                type="password" 
                placeholder="password" 
                value={password} 
                onChange={(e)=>setPassword(e.target.value)}
                minLength={8}
                required
                disabled={isLoading}
                className='User-Input'
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
