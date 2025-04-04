import React, { useMemo } from 'react';
import { Card } from 'antd';
import { Pie } from '@ant-design/plots';
import './styles.css';

const Charts = ({ transactions }) => {
    const pieData = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;
        
        transactions.forEach((transaction) => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
        });

        return [
            {
                type: 'Income',
                amount: totalIncome,
                percentage: ((totalIncome / (totalIncome + totalExpense)) * 100).toFixed(1)
            },
            {
                type: 'Expense',
                amount: totalExpense,
                percentage: ((totalExpense / (totalIncome + totalExpense)) * 100).toFixed(1)
            }
        ];
    }, [transactions]);

    const pieConfig = {
        data: pieData,
        angleField: 'amount',
        colorField: 'type',
        radius: 0.8,
        color: ['#2ecc71', '#e74c3c'],
        label: {
            type: 'outer',
            formatter: (datum) => `${datum.type}: ${datum.percentage}%`,
        },
        tooltip: {
            formatter: (datum) => ({
                name: datum.type,
                value: `₹${datum.amount.toFixed(2)} (${datum.percentage}%)`
            })
        }
    };

    return (
        <div className="charts-container">
            <div className="charts-row">
                <h2>Income vs Expense Distribution</h2>
                <Card className="chart-card">
                    {pieData.some(data => data.amount > 0) ? (
                        <Pie {...pieConfig} />
                    ) : (
                        <div className="no-data">No transactions to display</div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Charts;