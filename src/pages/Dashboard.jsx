import React, { useEffect } from 'react';
import { useState } from 'react';
import Headers from '../components/Header';
import Cards from '../components/Cards';
import AddExpenseModal from '../components/Modals/AddExpense';
import AddIncomeModal from '../components/Modals/addIncome';
import { addDoc, collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import TransactionsTable from '../components/TransactionsTable';
import Charts from '../components/Charts';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user] = useAuthState(auth);
    const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
    const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);

    const showExpenseModal = () => {
        setIsExpenseModalVisible(true);
    };

    const showIncomeModal = () => {
        setIsIncomeModalVisible(true);
    };

    const handleExpenseCancel = () => {
        setIsExpenseModalVisible(false);
    };

    const handleIncomeCancel = () => {
        setIsIncomeModalVisible(false);
    };

    const onFinish = async (values, type) => {
        const newTransaction = {
            type: type,
            date: values.date.format("YYYY-MM-DD"),
            amount: parseFloat(values.amount),
            tag: values.tag,
            name: values.name,
            createdAt: new Date(),
        };

        try {
            // Add to Firebase
            const docRef = await addDoc(collection(db, `users/${user.uid}/transactions`), newTransaction);
            
            // Update state with new transaction
            setTransactions(prevTransactions => [...prevTransactions, { ...newTransaction, id: docRef.id }]);
            
            toast.success("Transaction Added!");
            
            // Update UI based on transaction type
            if (type === "expense") {
                handleExpenseCancel();
            } else {
                handleIncomeCancel();
            }
        } catch (e) {
            toast.error("Couldn't add transaction");
            console.error("Error adding transaction:", e);
        }
    };

    async function fetchTransactions() {
        setLoading(true);
        try {
            if (user) {
                const q = query(collection(db, `users/${user.uid}/transactions`));
                const querySnapshot = await getDocs(q);
                let transactionsArray = [];
                querySnapshot.forEach((doc) => {
                    // Include document ID with the data
                    transactionsArray.push({
                        ...doc.data(),
                        id: doc.id
                    });
                });
                console.log("Fetched transactions:", transactionsArray); // Debug log
                setTransactions(transactionsArray);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Error fetching transactions");
        } finally {
            setLoading(false);
        }
    }

    const handleImportTransactions = async (importedTransactions, shouldAppend) => {
        try {
            setLoading(true);
            console.log("Starting import process:", { count: importedTransactions.length, shouldAppend });
            
            if (!shouldAppend) {
                // Delete existing transactions
                console.log("Deleting existing transactions...");
                const querySnapshot = await getDocs(collection(db, `users/${user.uid}/transactions`));
                const deletePromises = querySnapshot.docs.map(doc => 
                    deleteDoc(doc.ref)
                );
                await Promise.all(deletePromises);
                console.log("Existing transactions deleted");
            }

            // Add new transactions
            console.log("Adding new transactions...");
            const addPromises = importedTransactions.map(transaction =>
                addDoc(collection(db, `users/${user.uid}/transactions`), {
                    ...transaction,
                    amount: parseFloat(transaction.amount),
                    createdAt: new Date()
                })
            );
            await Promise.all(addPromises);
            console.log("New transactions added");

            // Refresh transactions and recalculate balances
            await fetchTransactions();
            calculateBalance();
            toast.success(`Transactions ${shouldAppend ? 'added to' : 'replaced in'} database!`);
        } catch (error) {
            console.error('Error importing transactions:', error);
            toast.error('Failed to import transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            // Delete from Firebase
            await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
            // Update local state
            setTransactions(prev => prev.filter(transaction => transaction.id !== id));
            toast.success('Transaction deleted successfully');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error('Failed to delete transaction');
        } finally {
            setLoading(false);
        }
    };

    const handleResetBalance = async () => {
        try {
            if (window.confirm('Are you sure you want to reset all transactions? This cannot be undone.')) {
                setLoading(true);
                // Delete all transactions from Firebase
                const querySnapshot = await getDocs(collection(db, `users/${user.uid}/transactions`));
                const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);
                
                // Reset local state
                setTransactions([]);
                setIncome(0);
                setExpense(0);
                setTotalBalance(0);
                toast.success('Balance reset successfully');
            }
        } catch (error) {
            console.error('Error resetting balance:', error);
            toast.error('Failed to reset balance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [user]);

  useEffect(() => {
        calculateBalance();
    }, [transactions]);

    const calculateBalance = () => {
      let incomeTotal = 0;
      let expensesTotal = 0;
  
      transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          incomeTotal += transaction.amount;
        } else {
          expensesTotal += transaction.amount;
        }
      });
  
      setIncome(incomeTotal);
      setExpense(expensesTotal);
      setTotalBalance(incomeTotal - expensesTotal);
    };

    if (!user) {
        return <div>Please login to view dashboard</div>;
    }

    return (
        <div className="dashboard-container">
            <Headers />
            <Cards 
                income={income}
                expense={expense}
                totalBalance={totalBalance}
                showExpenseModal={showExpenseModal}
                showIncomeModal={showIncomeModal}
                onReset={handleResetBalance}
            />
            <Charts transactions={transactions} />
            <TransactionsTable 
                transactions={transactions}
                onImport={handleImportTransactions}
                onDelete={handleDelete}
            />
            <AddExpenseModal
                isExpenseModalVisible={isExpenseModalVisible}
                handleExpenseCancel={handleExpenseCancel}
                onFinish={onFinish}
            />
            <AddIncomeModal
                isIncomeModalVisible={isIncomeModalVisible}
                handleIncomeCancel={handleIncomeCancel}
                onFinish={onFinish}
            />
        </div>
    );
};

export default Dashboard;