import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { FaChartPie, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => { 
    if(user){
      navigate('/dashboard');
    }
  },[loading, user]);

  function logoutFnc() {
    try {
      signOut(auth).then(() => {
        toast.success('Logged out successfully');
        navigate('/');
      }).catch((error) => {
        toast.error(error.message);
      });
    } catch(e) {
      toast.error(e.message);
    }
  }

  return (
    <nav className="navbar">
      <div className="logo-container">
        <FaChartPie className="logo-icon" />
        <p className="logo">FinFolio</p>
      </div>
      
      {user && (
        <div className="nav-right">
          <div className="user-info">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
              alt="profile" 
              className="avatar"
            />
            <span className="user-email">{user.email}</span>
          </div>
          <button className="logout-button" onClick={logoutFnc}>
            <FaSignOutAlt className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;