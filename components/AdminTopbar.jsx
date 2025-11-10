import React, { useEffect } from 'react'
import "../src/App.css";
import { useContext  } from 'react';
import { AuthContext } from '../context/AuthContext';   


function AdminTopbar() {
    const { logout,username,companyname,companyno ,firstname} = useContext(AuthContext);  

  useEffect(() => {
  console.log("Firstname from context:", firstname);
  console.log("Firstname from localStorage:", localStorage.getItem("firstname"));
}, [firstname]);


  return (
      <div className="bg-custom  p-2 d-flex align-items-center justify-content-between topbar-fixed" >
          <div className='d-flex align-item-centre'>
          <img src="/billinglogo.jpg"         
          alt="Logo" 
          style={{ width: '60px', height: '50px', marginRight: '10px', border: "2px solid black"  }} />  
          <h3 className="m-0 text-white bold" >ADMIN PANNEL</h3>  
          </div>   
  
        {/* Right: Profile Icon */}
        <div className="d-flex align-items-center">
          <span className="me-2 text-white">   {firstname ? firstname : username}</span>
          <div className='dropdown'>
          <a href='#'
            className="d-flex align-items-center text-light text-decoration-none dropdown-toggle"
            id="profileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
           >
            <img
            src= "profile.jpg "  
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
               console.log(" Logout button clicked");
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

export default AdminTopbar;