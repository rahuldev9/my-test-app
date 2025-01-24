import React, { useState,useEffect} from "react";
import './App.css';

import Nav from './Components/Nav';
// import Footer from './Components/Footer';
import Signup from './Components/Signup';
import PrivateComponent from './Components/PrivateComponent';
import Login from './Components/Login';
import Addproduct from './Components/Addproduct';
import ProductList from './Components/ProductList';
import Updateproduct from './Components/Updateproduct';
import Home from './Components/Home';
import Profile from './Components/Profile';
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';
import First from "./Components/First";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chat from "./Components/Chat";
import OtherProfile from "./Components/OtherProfile";
import Messagebox from "./Components/Messagebox";
import Notifications from "./Components/Notifiactions";
import Searchuser from "./Components/Searchuser";
import PersonalChat from "./Components/PersonalChat";
import Userinfo from "./Components/Userinfo";
import Addpost from "./Components/Addpost";


function App() {
  const savedColor = localStorage.getItem('theme') || 'white';  // default to light theme
  const savedText = savedColor === 'black' ? 'white' : 'black';

  const [color, setColor] = useState(savedColor);
  const [text, setText] = useState(savedText);

  // Apply theme styles to <body> on page load or when color changes
  useEffect(() => {
    document.body.style.backgroundColor = color;
    document.body.style.color = text;

    // Save the theme in localStorage
    localStorage.setItem('theme', color);
  }, [color, text]);  // Runs whenever `color` or `text` changes

  const toggleColor = () => {
    const newColor = color === 'white' ? 'black' : 'white';
    setColor(newColor);
    setText(newColor === 'black' ? 'white' : 'black');
  };
  return (
    <>
    <div className="App" class="color-box" style={{backgroundColor:color,color:text, margin: "0 auto",
      transition:"background-color 1s ease",height:'100%'}}>
      <BrowserRouter>
      
      <Nav/>
      <Routes>
        
        <Route path="/" element={<First/>}></Route>
        <Route path='/home' element={<Home/>}></Route>
        <Route element={<PrivateComponent/>}>
        <Route path='/products' element={<ProductList/>}></Route>
        <Route path='/add' element={<Addproduct/>}></Route>
        <Route path='/update/:id' element={<Updateproduct/>}></Route>
        <Route path='/logout' element={<h1>logout</h1>}></Route>
        <Route path='/profile' element={<Profile toggleColor={toggleColor}/>}></Route>
        <Route path='/chat' element={<Chat/>}></Route>
        <Route path="/profile/:userId" element={<OtherProfile/>}></Route>
        <Route path="/messagebox" element={<Messagebox/>}></Route>
        <Route path="/notify" element={<Notifications/>}></Route>
        <Route path="/searchuser" element={<Searchuser/>}></Route>
        <Route path="/personalchat" element={<PersonalChat/>}></Route>
        <Route path="/userinfo" element={<Userinfo/>}></Route>
        <Route path="/addpost" element={<Addpost/>}></Route>
        </Route>
        
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
      </Routes>
      </BrowserRouter>
    </div>
    </>
  );
}

export default App;
