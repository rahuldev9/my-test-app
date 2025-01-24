import React,{useState} from 'react'

function Darkmode({ toggleColor, color }) {
  
  return (
    <div>
      <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-end',}}>
      <input type="checkbox" class="theme-checkbox" onClick={toggleColor}></input>
      </div>
      
    </div>
  )
}

export default Darkmode
