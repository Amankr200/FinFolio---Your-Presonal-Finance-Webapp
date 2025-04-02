import React from 'react';
import './styles.css';

const Button = ({text, onclick , blue, disabled}) => {
    return (
        <button className={blue ? "btn btn-blue":"btn"} onClick={onclick} disabled={disabled}>
            {text}
        </button>
    );
};

export default Button;