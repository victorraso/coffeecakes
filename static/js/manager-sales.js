
function kickstartSales() {
    let currentSortBy = 'newest';
    document.getElementById('sort-options').value = currentSortBy;

    function salesReport(sortBy, year, month, day, status) {
        fetch('/get-orders')
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    let filtered = filterOrders(data.orders, year, month, day, status);
                    filtered = sortOrders(filtered, sortBy);
                    renderOrders(filtered);  
                }
            })
            .catch((error) => {
                console.error('Error fetching orders for the manager:', error);
            });
    }

    function sortOrders(orders, sortBy) {
        switch (sortBy) {
            case 'newest':
                return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'oldest':
                return orders.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'priceAsc':
                return orders.sort((a, b) => a.price - b.price);
            case 'priceDesc':
                return orders.sort((a, b) => b.price - a.price);
            default:
                return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    function filterOrders(orders, year, month, day, status) {
        return orders.filter((order) => {
            const orderDate = new Date(order.date);
            return (
                (!year || orderDate.getFullYear() === parseInt(year)) &&
                (!month || orderDate.getMonth() + 1 === parseInt(month)) && 
                (!day || orderDate.getDate() === parseInt(day)) && 
                (!status || order.status === status)
            );
        });
    }

    function renderOrders(orders) {
        const accordion = document.getElementById('accordionFlush');
        accordion.innerHTML = '';

        let totalPrice = 0;

        orders.forEach((order) => {
            const accordionItem = document.createElement('div');
            accordionItem.classList.add('accordion-item');
            accordion.appendChild(accordionItem);

            const accordionHead = document.createElement('h2');
            accordionHead.classList.add('accordion-header');
            accordionItem.appendChild(accordionHead);

            const accordionBtn = document.createElement('button');
            accordionBtn.classList.add('accordion-button', 'collapsed')
            accordionBtn.setAttribute('type', 'button');
            accordionBtn.setAttribute('data-bs-toggle', 'collapse');
            accordionBtn.setAttribute('data-bs-target', `#flush-collapse${order.id}`);
            accordionBtn.setAttribute('aria-expanded', 'false');
            accordionBtn.setAttribute('aria-controls', `flush-collapse${order.id}`);
            accordionHead.appendChild(accordionBtn);

            const aBtnNumber = document.createElement('div');
            aBtnNumber.classList.add('aBtn-number');
            aBtnNumber.innerText = `${order.id}`;
            accordionBtn.appendChild(aBtnNumber);

            const aBtnTitle = document.createElement('div');
            aBtnTitle.classList.add('aBtn-title');
            aBtnTitle.innerText = `${order.token}`;
            accordionBtn.appendChild(aBtnTitle);

            const aBtnPrice = document.createElement('div');
            aBtnPrice.classList.add('aBtn-price');
            aBtnPrice.innerText = `$${(order.price / 100).toFixed(2)}`;
            accordionBtn.appendChild(aBtnPrice);

            const aBtnDate = document.createElement('div');
            aBtnDate.classList.add('aBtn-date');
            const formatDate = new Date(order.date).toLocaleDateString('en-GB');
            aBtnDate.innerText = formatDate;
            accordionBtn.appendChild(aBtnDate);

            const accordionCollapse = document.createElement('div');
            accordionCollapse.classList.add('accordion-collapse', 'collapse');
            accordionCollapse.setAttribute('id', `flush-collapse${order.id}`)
            accordionCollapse.setAttribute('data-bs-parent', '#accordionFlush');
            accordionItem.appendChild(accordionCollapse);

            const accordionBody = document.createElement('div');
            accordionBody.classList.add('accordion-body');
            accordionCollapse.appendChild(accordionBody);

            const orderExtraInfo = document.createElement('div');
            orderExtraInfo.classList.add('orders-extra-info');
            accordionBody.appendChild(orderExtraInfo);

            const orderItems = document.createElement('div');
            orderItems.classList.add('order-items');
            orderExtraInfo.appendChild(orderItems);
            const orderItemsTitle = document.createElement('h5');
            orderItemsTitle.innerText = 'Items';
            orderItems.appendChild(orderItemsTitle);
            const itemsUl = document.createElement('ul');
            itemsUl.classList.add('mb-4');
            orderItems.appendChild(itemsUl);
            itemsUl.innerHTML = '';
            order.items.forEach(item => {
                const itemLi = document.createElement('li');
                itemLi.textContent = `${item.quantity} x ${item.id} - $${(item.amountPrice / 100).toFixed(2)}`;
                itemsUl.appendChild(itemLi);
            });

            const createdAt = document.createElement('div');
            orderExtraInfo.appendChild(createdAt);
            const createdTitle = document.createElement('h5');
            createdTitle.innerText = 'Created On';
            createdAt.appendChild(createdTitle);
            const createdValue = document.createElement('p');
            createdValue.classList.add('mb-4');
            createdValue.innerText = `${order.date}`;
            createdAt.appendChild(createdValue);

            const readyAt = document.createElement('div');
            orderExtraInfo.appendChild(readyAt);
            const readyTitle = document.createElement('h5');
            readyTitle.innerText = 'Ready On';
            readyAt.appendChild(readyTitle);
            const readyValue = document.createElement('p');
            readyValue.classList.add('mb-4');
            readyValue.innerText = `${order.ready}`;
            readyAt.appendChild(readyValue);

            const orderStatus = document.createElement('div');
            orderExtraInfo.appendChild(orderStatus);
            const statusTitle = document.createElement('h5');
            statusTitle.innerText = 'Status';
            orderStatus.appendChild(statusTitle);
            const statusValue = document.createElement('p');
            statusValue.classList.add('mb-4', 'text-capitalize');
            statusValue.innerText = `${order.status}`;
            orderStatus.appendChild(statusValue);

            const payIntent = document.createElement('div');
            orderExtraInfo.appendChild(payIntent);
            const payTitle = document.createElement('h5');
            payTitle.innerText = 'Payment Intent';
            payIntent.appendChild(payTitle);
            const intentValue = document.createElement('p');
            intentValue.classList.add('mb-1');
            intentValue.innerText = `${order.paymentId}`;
            payIntent.appendChild(intentValue);

            totalPrice += order.price;

        });

        const totalValue = document.querySelector('.total-container p');
        if (totalValue) {
            totalValue.innerText = `$${(totalPrice / 100).toFixed(2)}`;
        }
    }


    document.getElementById('sort-options').addEventListener('change', (x) => {
        currentSortBy = x.target.value;
        const year = document.getElementById('filter-year').value;
        const month = document.getElementById('filter-month').value;
        const day = document.getElementById('filter-day').value;
        salesReport(currentSortBy, year, month, day);
    });


    /* SET YEAR AND DAYS FOR THE FILTERING BUTTONS */
    function setYears() {
        const yearMenu = document.getElementById('filter-year');
        const currentYear = new Date().getFullYear();
        const startYear = 2023;

        yearMenu.innerHTML = '<option value="">All</option>';

        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearMenu.appendChild(option);
        }
    }

    function setDays(year, month) {
        const dayMenu = document.getElementById('filter-day');
        dayMenu.innerHTML = '<option value="">All</option>';

        if (!month) return;

        const daysMonth = new Date(year || new Date().getFullYear(), month, 0).getDate();

        for (let day = 1; day <= daysMonth; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            dayMenu.appendChild(option);
        }
    }

    /* FILTER LISTENERS */
    document.querySelectorAll('#filter-year, #filter-month, #filter-day, #filter-status').forEach(x => {
        x.addEventListener('change', () => {
            const year = document.getElementById('filter-year').value;
            const month = document.getElementById('filter-month').value;
            const day = document.getElementById('filter-day').value;
            const status = document.getElementById('filter-status').value;
            salesReport(currentSortBy, year, month, day, status);

            if (x.id === 'filter-year' || x.id === 'filter-month') {
                setDays(year, month);
            }
        });
    });
    

    function resetToday() {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const currentDay = new Date().getDate();
        const yearMenu = document.getElementById('filter-year');
        const monthMenu = document.getElementById('filter-month');
        const dayMenu = document.getElementById('filter-day');

        document.getElementById('filter-status').value = '';

        yearMenu.value = currentYear;

        monthMenu.value = currentMonth;

        setDays(currentYear, currentMonth);

        dayMenu.value = currentDay;

        salesReport('newest', currentYear, currentMonth, currentDay);
    }

    setYears();
    resetToday();
}
