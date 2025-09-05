import React from 'react'
import AuthService from '../Services/AuthService'
import { Navigate } from 'react-router-dom';

function ProtectedRoute({children}) {
    const isAuthenticated = AuthService.isAuthenticated();
    if(!isAuthenticated){
        return <Navigate to={"/login"} replace/>
    }
    return children;
}

export default ProtectedRoute
