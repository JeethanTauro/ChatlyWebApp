import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import AuthService from '../Services/AuthService';

export default function Login() {
        const[username  , setUsername]   =  useState('');
        const[password  , setPassword]   =  useState('');
        const[message, setMessage] = useState('');
        const[isLoading , setIsLoading] = useState(false);
        const navigate = useNavigate();
        const handleLogin = async(e)=>{
            e.preventDefault();
            setMessage('');
            setIsLoading(true);
            try{
                const result = await AuthService.login(username, password);
                if(result.success){
                    setMessage("Logged in Successfully");
                }
                setTimeout(()=>{
                    navigate('/ChatArea');
                },2000);
            }
            catch(error){
                setMessage(error.message || 'Login failed, Please try again');
                console.error('Login Failed'+error);
                
            }
            finally{
                setIsLoading(false);
            }

        }
  return (
    <div className='login-container'>
        <div className='login-box'>
            <div className='login-header'>
                <h1>Login</h1>
                <p>Login to start chatting</p>
            </div>
            <form onSubmit={handleLogin} className='login-form'>
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
                        disabled={!username.trim()  || !password.trim() || isLoading}
                        className='login-button'>
                            {isLoading ? 'Logging in...' :  'Login'}
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
