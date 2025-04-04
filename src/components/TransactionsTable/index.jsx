import React, { useState } from 'react';
import { Table, Select, Radio, Modal } from 'antd'; // Add Modal import
import './styles.css';
import search from '../../assets/search.svg';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const { Option } = Select;

function TransactionsTable({ transactions, onImport, onDelete }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [selectedTag, setSelectedTag] = useState("");
    const [sortKey, setSortKey] = useState("");
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [pendingImport, setPendingImport] = useState(null);

    const handleDelete = async (id) => {
        try {
            if (window.confirm('Are you sure you want to delete this transaction?')) {
                await onDelete(id);
                toast.success('Transaction deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error('Failed to delete transaction');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `₹${amount}`
        },
        {
            title: 'Tag',
            dataIndex: 'tag',
            key: 'tag'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <button 
                    className="btn btn-delete"
                    onClick={() => handleDelete(record.id)}
                >
                    Delete
                </button>
            ),
        }
    ];

    const filteredTransactions = transactions.filter((transaction) => {
        const searchMatch = searchTerm
            ? transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        const tagMatch = selectedTag ? transaction.tag === selectedTag : true;
        const typeMatch = typeFilter ? transaction.type === typeFilter : true;

        return searchMatch && tagMatch && typeMatch;
    });

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (sortKey === "date") {
            return new Date(b.date) - new Date(a.date); // Newest first
        } else if (sortKey === "amount") {
            return b.amount - a.amount; // Highest first
        }
        return 0;
    });

    const exportToCsv = () => {
        const ws = XLSXUtils.json_to_sheet(sortedTransactions);
        const wb = XLSXUtils.book_new();
        XLSXUtils.book_append_sheet(wb, ws, "Transactions");
        const excelBuffer = XLSXWrite(wb, { bookType: 'csv', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'text/csv;charset=utf-8' });
        saveAs(data, 'transactions.csv');
    };

    const importFromCsv = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const rows = text.split('\n');
                const headers = rows[0].toLowerCase().split(',');
                const newTransactions = [];

                // Define expected column order
                const expectedColumns = {
                    name: -1,
                    amount: -1,
                    tag: -1,
                    type: -1,
                    date: -1
                };

                // Map CSV columns to expected columns
                headers.forEach((header, index) => {
                    const cleanHeader = header.trim();
                    if (expectedColumns.hasOwnProperty(cleanHeader)) {
                        expectedColumns[cleanHeader] = index;
                    }
                });

                // Validate required columns exist
                if (Object.values(expectedColumns).includes(-1)) {
                    toast.error('CSV file is missing required columns');
                    console.error('Missing columns:', expectedColumns);
                    return;
                }

                // Process data rows
                for (let i = 1; i < rows.length; i++) {
                    if (rows[i].trim() === '') continue;
                    const values = rows[i].split(',');
                    
                    const transaction = {
                        name: values[expectedColumns.name].trim(),
                        amount: parseFloat(values[expectedColumns.amount].replace('₹', '').trim()),
                        tag: values[expectedColumns.tag].trim(),
                        type: values[expectedColumns.type].trim().toLowerCase(),
                        date: values[expectedColumns.date].trim(),
                        createdAt: new Date()
                    };

                    if (!isNaN(transaction.amount)) {
                        newTransactions.push(transaction);
                    }
                }

                if (newTransactions.length > 0) {
                    console.log("Parsed transactions:", newTransactions);
                    setPendingImport(newTransactions);
                    setImportModalVisible(true);
                } else {
                    toast.error('No valid transactions found in CSV');
                }
            } catch (error) {
                console.error('Error parsing CSV:', error);
                toast.error('Error parsing CSV file');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    const handleImportDecision = async (shouldAppend) => {
        try {
            if (!pendingImport || !onImport) {
                toast.error("No transactions to import!");
                return;
            }
            
            console.log("Importing transactions:", {
                count: pendingImport.length,
                shouldAppend
            });
            
            await onImport(pendingImport, shouldAppend);
            setPendingImport(null);
            setImportModalVisible(false);
            toast.success(`Successfully ${shouldAppend ? 'added' : 'replaced'} transactions`);
        } catch (error) {
            console.error("Error in handleImportDecision:", error);
            toast.error("Failed to import transactions");
        }
    };

    return (
        <div className="transactions-container">
            <div className="toolbar">
                <div className="search-container">
                    <img src={search} alt="search" width="16" />
                    <input
                        placeholder="Search by Name"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="csv-actions">
                    <button className="btn" onClick={exportToCsv}>
                        Export to CSV
                    </button>
                    <label htmlFor="file-csv" className="btn btn-blue">
                        Import from CSV
                    </label>
                    <input
                        onChange={importFromCsv}
                        id="file-csv"
                        type="file"
                        accept=".csv"
                        required
                        style={{ display: "none" }}
                    />
                </div>
            </div>

            <div className="table-header">
                <h2>My Transactions</h2>
                <div className="table-actions">
                    <Select
                        className="type-filter"
                        onChange={(value) => setTypeFilter(value)}
                        value={typeFilter}
                        placeholder="Filter by type"
                        allowClear
                    >
                        <Option value="">All</Option>
                        <Option value="income">Income</Option>
                        <Option value="expense">Expense</Option>
                    </Select>
                    <Radio.Group
                        className="sort-group"
                        onChange={(e) => setSortKey(e.target.value)}
                        value={sortKey}
                    >
                        <Radio.Button value="">No Sort</Radio.Button>
                        <Radio.Button value="date">Sort by Date</Radio.Button>
                        <Radio.Button value="amount">Sort by Amount</Radio.Button>
                    </Radio.Group>
                </div>
            </div>

            <Table 
                dataSource={sortedTransactions} 
                columns={columns} 
                pagination={false}
                rowKey="id"
            />

            {/* Add Import Modal */}
            <Modal
                title="Import Transactions"
                open={importModalVisible}  // Changed from 'visible' to 'open'
                onCancel={() => setImportModalVisible(false)}
                footer={null}
            >
                <div className="import-options">
                    <h3>How would you like to import these transactions?</h3>
                    <p>Found {pendingImport?.length || 0} transactions to import.</p>
                    <div className="import-buttons">
                        <button 
                            className="btn btn-blue"
                            onClick={() => handleImportDecision(true)}
                        >
                            Add to Existing Data
                        </button>
                        <button 
                            className="btn"
                            onClick={() => handleImportDecision(false)}
                        >
                            Replace Existing Data
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default TransactionsTable;