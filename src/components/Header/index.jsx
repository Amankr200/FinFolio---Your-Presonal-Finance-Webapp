import React, { use } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

const Header = () => {
  const [user, loading] = useAuthState(auth);
const navigate = useNavigate();
useEffect(() => { 
  if(user){
    navigate('/dashboard');
  }
},[loading, user]);

  function logoutFnc() {
    try{

      signOut(auth).then(() => {
        toast.success('Logged out successfully');
        navigate('/');
      }).catch((error) => {
        toast.error(error.message);
      });
      
    }catch(e){
       toast.error(e.message);
    }
   
  }
  return (
    <div className="navbar">
      <p className="logo">Financely</p> 
      {user && <p className= "logo link" onClick={logoutFnc}>
      Logout</p>}
      
    </div>
  );
};

export default Header;