document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const editForm = document.getElementById('edit-transaction-form');
    const transactionList = document.getElementById('transaction-list');
    const totalAmount = document.getElementById('total-amount');
    let currentEditId = null;

    const fetchTransactions = async () => {
        const response = await fetch('/api/transactions');
        const transactions = await response.json();
        updateTransactions(transactions);
    };

    const updateTransactions = (transactions) => {
        transactionList.innerHTML = '';
        let total = 0;
        transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${transaction.description} - ₹${transaction.amount} (${transaction.type})
                <div>
                    <button onclick="editTransaction('${transaction._id}')" class="edit-button">Edit</button>
                    <button onclick="deleteTransaction('${transaction._id}')" class="delete-button">Delete</button>
                </div>
            `;
            transactionList.appendChild(li);
            total += transaction.type === 'income' ? transaction.amount : -transaction.amount;
        });
        totalAmount.textContent = `₹${total}`;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description')
        };
        
        const response = await fetch('/api/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const transaction = await response.json();
        fetchTransactions();
        form.reset();
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const data = {
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description')
        };

        const response = await fetch(`/api/transaction/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const transaction = await response.json();
        fetchTransactions();
        closeModal();
    });

    window.deleteTransaction = async (id) => {
        if (confirm("Are you sure to delete this transaction?")) {
            await fetch(`/api/transaction/${id}`, { method: 'DELETE' });
            fetchTransactions();
        }
    };

    window.editTransaction = async (id) => {
        currentEditId = id;
        const response = await fetch(`/api/transaction/${id}`);
        const transaction = await response.json();
        document.getElementById('edit-type').value = transaction.type;
        document.getElementById('edit-amount').value = transaction.amount;
        document.getElementById('edit-description').value = transaction.description;
        openModal();
    };

    const openModal = () => {
        document.getElementById('edit-modal').style.display = 'block';
    };

    const closeModal = () => {
        document.getElementById('edit-modal').style.display = 'none';
    };

    window.closeModal = closeModal;

    fetchTransactions();
});
