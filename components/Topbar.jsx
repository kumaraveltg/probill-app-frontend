import React from 'react'
import "../src/App.css";
import { useContext  } from 'react';
import { AuthContext } from '../context/AuthContext';   


function Topbar() {
    const { logout,username,companyname,companyno } = useContext(AuthContext);  

  return (
      <div className="bg-custom  p-2 d-flex align-items-center justify-content-between topbar-fixed" >
          <div className='d-flex align-item-centre'>
          <img src="/billinglogo.jpg"         
          alt="Logo" 
          style={{ width: '60px', height: '50px', marginRight: '10px', border: "2px solid black"  }} />  
          <h3 className="m-0 text-white bold" >{companyname}({companyno})</h3>  
          </div>      
          
          
          {/* Center: Search Box */}
        <form className="d-flex mx-3 flex-grow-1" style={{ maxWidth: "600px" }}>
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search..."
          />
          <button className="btn btn-custom" type="submit">
            Search
          </button>
        </form>
  
        {/* Right: Profile Icon */}
        <div className="d-flex align-items-center">
          <span className="me-2 text-white">   {username ? username : "User"}</span>
          <div className='dropdown'>
          <a href='#'
            className="d-flex align-items-center text-light text-decoration-none dropdown-toggle"
            id="profileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
           >
            <img
            src= "profile.jpg " // replace with user profile pic
            alt="Profile"
            className="rounded-circle"
            style={{ width: "40px", height: "40px" }}
          /></a>
          <ul className="dropdown-menu dropdown-menu-end text small shadoe"
            aria-labelledby='ProfileDropdown'
          > 
          <li> 
            <a className="dropdown-item " href="#">Edit Profile</a>
          </li>
          <li>
            <a className='dropdown-item' href="#" onClick={(e) => {
               console.log("🔴 Logout button clicked");
                e.preventDefault(); // prevent page reload
                logout();           // call your logout function
              }}>Logout</a>
          </li>

          </ul>
        </div>
        </div>
      </div>
    
)
}

export default Topbar