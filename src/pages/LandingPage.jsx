import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="hero-section">
                <div className="content-wrapper">
                    <h1 className="title">
                        Welcome to <span className="highlight">FinFolio</span>
                        <br />
                        <span className="subtitle">Your Personal Finance Companion</span>
                    </h1>
                    <p className="description">
                        Take control of your money with our powerful personal finance tracker.
                        Monitor expenses, track income, and achieve your financial goals.
                    </p>
                    <div className="cta-buttons">
                        <button 
                            className="cta-button primary" 
                            onClick={() => navigate('/signup')}
                        >
                            Get Started
                        </button>
                        
                    </div>
                </div>
                
                <div className="visual-elements">
                    <div className="floating-card card-1">
                        <div className="card-content">
                            <h3>Smart Tracking</h3>
                            <p>Monitor your spending patterns</p>
                        </div>
                    </div>
                    <div className="floating-card card-2">
                        <div className="card-content">
                            <h3>Easy Reports</h3>
                            <p>Visual insights of your finances</p>
                        </div>
                    </div>
                    <div className="floating-card card-3">
                        <div className="card-content">
                            <h3>Secure Data</h3>
                            <p>Your information is safe with us</p>
                        </div>
                    </div>
                    <div className="circle-decoration"></div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;