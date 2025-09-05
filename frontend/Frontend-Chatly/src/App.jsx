import React, { Component } from 'react'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Navbar from './Components/Navbar.jsx'
import MainPage from './Pages/MainPage.jsx'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import ProtectedRoute from './Components/ProtectedRoute.jsx'
import PageDoesNotExist from './Pages/PageDoesNotExist.jsx'
import Chat from './Pages/Chat.jsx'
function App() {
  return (
    //React Router helps us to navigate through our pages without reloading, so ur app works a SPA
    //Helps us define all our routes
    //based on our routes it will render the components without refreshing the page
    //if we go to the route which does not exist, then we get 404 {we can actuall create our own 404}

        <Router>
            <div className='App'>
                <Navbar/> {/*this will be on top of our app*/}
                <Routes>{/*Here we will have all our routes*/}
                    <Route path='/' element={<MainPage/>}/>
                    <Route path='/login' element={<Login/>}/>
                    <Route path='/signup' element={<Signup/>}/>
                    {/* Here we will have our authentication logic */}
                    <Route path='/ChatArea' element={
                        <ProtectedRoute> 
                            <Chat/>
                        </ProtectedRoute>
                    }/>
                    <Route path='*' element={<PageDoesNotExist/>}/>
                </Routes>
            </div>
        </Router>
  )
}

export default App
