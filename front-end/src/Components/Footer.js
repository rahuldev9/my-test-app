import React from 'react'
import {Link} from 'react-router-dom'

function Footer() {
  const auth=localStorage.getItem('user');
  return (
    <div style={{position:'fixed',bottom:"0px",textAlign:'center',width:'100%',background:'yellow',height:'50px'}}>
      { auth ? <div style={{display:'flex',flexDirection:'row'}}>
      <h4><Link to='/home'>Home</Link></h4>
        <h4><Link to='/products'>Products</Link></h4>
        <h4><Link to='/add'>Add produts</Link></h4>
        {/* <h4><Link to='/update'>update products</Link></h4> */}
        <h4><Link to='/profile'>Profile</Link></h4>
        {/* <h4><Link onClick={logout} to='/sigup'>Logout({JSON.parse(auth).name})</Link></h4> */}
        </div>
        :
        <div style={{display:'flex',flexDirection:'row'}}>
        </div>
      }
    </div>
  )
}

export default Footer
