import React from 'react';
import './styles.css';

const Button = ({text, onclick , blue}) => {
    return (
        <button className={blue ? "btn btn-blue":"btn"} onClick={onclick}>
            {text}
        </button>
    );
};

export default Button;