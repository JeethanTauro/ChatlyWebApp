import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Login() {
        const[username  , setUsername]   =  useState('');
        const[password  , setPassword]   =  useState('');
        const[email  , setEmail]   =  useState('');
        const[message, setMessage] = useState('');
        const[isLoading , setIsLoading] = useState(false);
        const navigate = useNavigate();
        handleLogin = async(e)=>{
            e.preventDefault();
            setMessage('');
            setIsLoading(true);
            try{
                const result = await authservice.login(username, password);
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
    <div className='Login-Container'>
        <div className='Login-Box'>
            <div className='Login-Header'>
                <h1>Login</h1>
                <p>Login to start chatting</p>
            </div>
            <form onSubmit={handleLogin} className='Login-Form'>
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
                        disabled={!username.trim()  || !password.trim() || isLoading}
                        className='Login-Button'>
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
