import React from 'react';
import './styles.css'; // Assuming you have a CSS file for styles
import { Card, Row } from 'antd';
import Button from '../Button'; // Import the Button component

const Cards = ({ 
    income, 
    expense, 
    totalBalance, 
    showExpenseModal, 
    showIncomeModal,
    onReset 
}) => {
    return (
        <div>
            <Row className="my-row">
                <Card bordered={true} className="my-card">
                    <h2>Current Balance</h2>
                    <p>₹{totalBalance}</p>
                    <Button text="Reset Balance" blue={true} onclick={onReset} />
                </Card>

                <Card variant={true} className="my-card">
                    <h2>Total Income</h2>
                    <p>₹{income}</p>
                    <Button text="Add Income" blue={true} onclick={showIncomeModal} />
                </Card>

                <Card variant={true} className="my-card">
                    <h2>Total Expenses</h2>
                    <p>₹{expense}</p>
                    <Button text="Add Expense" blue={true} onclick={showExpenseModal} />
                </Card>
            </Row>
        </div>
    );
};

export default Cards;