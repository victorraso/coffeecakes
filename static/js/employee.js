document.addEventListener('DOMContentLoaded', () => {
    function getProcessingOrders() {
        fetch('/get-orders')
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    const cardsContainer = document.querySelector('.cards-container');
                    const row = cardsContainer.querySelector('.row');

                    row.innerHTML = '';

                    data.orders.forEach((order) => {
                        if (order.status === 'processing') {
                            const cardContainer = document.createElement('div');
                            cardContainer.classList.add('col-sm-6', 'mb-3');
                            row.appendChild(cardContainer);
    
                            const card = document.createElement('div');
                            card.classList.add('card');
                            cardContainer.appendChild(card);
    
                            const cardBody = document.createElement('div');
                            cardBody.classList.add('card-body');
                            card.appendChild(cardBody);
    
                            const cardTitle = document.createElement('h5');
                            cardTitle.classList.add('card-title', 'card-title-xxx');
                            cardTitle.textContent = `${order.token}`
                            cardBody.appendChild(cardTitle);
    
                            const cardText = document.createElement('p');
                            cardText.classList.add('card-text', 'card-text-xxx');
                            cardBody.appendChild(cardText);
    
                            const cardUl = document.createElement('ul');
                            order.items.forEach((item) => {
                                const cardItem = document.createElement('li');
                                cardItem.textContent = `${item.quantity} x ${item.id}`;
                                cardUl.appendChild(cardItem);
                            });
                            cardText.appendChild(cardUl);
    
                            const cardButton = document.createElement('a');
                            cardButton.classList.add('btn', 'btn-primary');
                            cardButton.textContent = 'See Order';
                            cardButton.addEventListener('click', () => {
                                openModal(order);
                                const modal = new bootstrap.Modal(document.getElementById('fullScreenModal'));
                                modal.show();
                            });
                            cardBody.appendChild(cardButton);
                        }
                    });
                } else {
                    alert('Failed to fetch data.');
                }
            })
            .catch((error) => {
                console.error('Error fetching orders:', error);
                alert('Something went wrong while fetching orders.');
            });
    }

    function openModal(order) {

        const modal = document.getElementById('fullScreenModal');
        const orderTitle = document.getElementById('fullScreenModalLabel');
        orderTitle.innerHTML = `${order.token}`;
        const row = modal.querySelector('.row');
        const readyBtn = document.querySelector('.order-ready-btn');

        row.innerHTML = '';

        order.items.forEach((item) => {
            for (let i = 0; i < item.quantity; i++) {

                const itemCol = document.createElement('div');
                itemCol.classList.add('col-sm-6', 'mb-3');
                row.appendChild(itemCol);
    
                const itemCard = document.createElement('div');
                itemCard.classList.add('card');
                itemCol.appendChild(itemCard);
    
                const itemCardBody = document.createElement('div');
                itemCardBody.classList.add('card-body', 'modal-card-body');
                itemCard.appendChild(itemCardBody);
    
                const itemTitle = document.createElement('h5');
                itemTitle.classList.add('card-title', 'modal-card-name');
                itemTitle.innerText = `${item.id}`
                itemCardBody.appendChild(itemTitle);

                const checkBox = document.createElement('input');
                checkBox.type = 'checkbox';
                checkBox.classList.add('modal-card-checkbox', 'form-check-input');
                itemCardBody.appendChild(checkBox);

                checkBox.addEventListener('change', () => {
                    if (checkBox.checked) {
                        itemCard.classList.add('green-back');
                    } else {
                        itemCard.classList.remove('green-back');
                    }
                });

            }

            const allBoxes = modal.querySelectorAll('.modal-card-checkbox');

            readyBtn.disabled = true;

            allBoxes.forEach((box) => {
                box.addEventListener('change', () => {
                    const allChecked = Array.from(allBoxes).every((cb) => cb.checked);
                    readyBtn.disabled = !allChecked;
                });
            });

        });

        readyBtn.addEventListener('click', () => {
            updateOrderStatus(order.token);
        });
    }

    function updateOrderStatus(token) {
        fetch(`/update-order-status/${token}`, {
            method: 'POST',
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                closeModal();
                getProcessingOrders();
                updateHistory();
            } else {
                console.error('Failed to update status');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function closeModal() {
        const modal = document.getElementById('fullScreenModal');
        const modalBoot = bootstrap.Modal.getInstance(modal);
        modalBoot.hide();
    }

    function updateHistory() {
        fetch(`/get-orders`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const canvasBody = document.querySelector('.offcanvas-body');
                    const canvasList = canvasBody.querySelector('.list-group');

                    canvasList.innerHTML = '';

                    const doneOrders = data.orders.filter(order => order.status === 'done');
                    doneOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

                    const lastOrders = doneOrders.slice(0, 20);

                    lastOrders.forEach((order) => {
                        const historyItem = document.createElement('li');
                        historyItem.classList.add('list-group-item', 'history-item');
                        historyItem.innerText = `${order.token}`;
                        canvasList.appendChild(historyItem);

                        historyItem.addEventListener('click', () => {
                            historyModal(order);
                            const hModal = new bootstrap.Modal(document.getElementById('historyModal'));
                            hModal.show();
                        });
                    });
                } else {
                    console.error('Failed to fetch order history')
                }
            })
            .catch((error) => {
                console.error('Error updating history', error);
            });
    }

    function historyModal(order) {
        const modal = document.getElementById('historyModal');
        const modalTitle = modal.querySelector('.modal-title');
        modalTitle.innerText = `${order.token}`;

        const modalUl = modal.querySelector('.modal-body ul');

        modalUl.innerHTML = '';

        order.items.forEach(item => {
            const modalItem = document.createElement('li');
            modalItem.textContent = `${item.quantity} x ${item.id}`;
            modalUl.appendChild(modalItem);
        });

        const modalTotal = modal.querySelector('.modal-body h5');
        modalTotal.innerText = `Total: $${(order.price / 100).toFixed(2)}`;
    }

    const logoutLink = document.querySelector('#logoutlink');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            window.location.href = logoutLink.getAttribute('href');
        });
    }

    setInterval(getProcessingOrders, 10000);
    
    getProcessingOrders();

    updateHistory();

});

