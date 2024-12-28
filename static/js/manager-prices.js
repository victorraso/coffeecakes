document.addEventListener('DOMContentLoaded', () => {

    /* Format input price */
    document.body.addEventListener('input', (event) => {
        if (event.target.classList.contains('format-price')) {
            let value = event.target.value.replace(/\D/g, '');
            if (value) {
                value = (parseInt(value, 10) / 100).toFixed(2);
            } else {
                value = '';
            }
            event.target.value = value;

            const inputDiv = event.target.closest('.price-div');
            const updateBtn = inputDiv ? inputDiv.querySelector('.new-price-btn') : null;

            if (updateBtn) {
                if (event.target.value.trim() !== '') {
                    updateBtn.disabled = false;
                } else {
                    updateBtn.disabled = true;
                }
            }
        }
    });

    /* Update Price */
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('new-price-btn')) {
            const priceInput = event.target.closest('.price-div').querySelector('.format-price');
            const newPrice = event.target.closest('.price-div').querySelector('.format-price').value.replace(',', '').trim();

            if (newPrice) {
                const itemId = event.target.closest('tr').querySelector('.table-item-id').innerText;
                const itemName = event.target.closest('tr').querySelector('.table-item-name').innerText;

                fetch('/update-item-price', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        item_id: itemId,
                        item_name: itemName,
                        new_price: newPrice,
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Price Updated!');
                        priceInput.value = '';
                        kickstartPrices();
                    } else {
                        alert('Error Occurred');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        }
    })
});

/* Get items from database and render to html */
function kickstartPrices() {
    fetch('/get-all-items')
        .then(response => response.json())
        .then(data => {
            if (data.success) {

                const coffeeTableBody = document.querySelector('.coffee-table-body');
                coffeeTableBody.innerHTML = '';

                const teaTableBody = document.querySelector('.tea-table-body');
                teaTableBody.innerHTML = '';

                const cakesTableBody = document.querySelector('.cakes-table-body');
                cakesTableBody.innerHTML = '';

                const cookiesTableBody = document.querySelector('.cookies-table-body');
                cookiesTableBody.innerHTML = '';

                const extrasTableBody = document.querySelector('.extras-table-body');
                extrasTableBody.innerHTML = '';

                data.items.forEach(item => {
                    if (item.category === 1) {
                        createTable(item, coffeeTableBody);
                    } else if (item.category === 2) {
                        createTable(item, teaTableBody);
                    } else if (item.category === 3) {
                        createTable(item, cakesTableBody);
                    } else if (item.category === 4) {
                        createTable(item, cookiesTableBody);
                    } else if (item.category === 5) {
                        createTable(item, extrasTableBody);
                    }

                });
            }
        })
        .catch(error => {
            console.error('Error fetching items:', error);
        });

    /* FETCH SIZES TABLE */
    fetch('/get-all-sizes')
        .then(response => response.json())
        .then(data => {
            if (data.success) {

                const sizesTableBody = document.querySelector('.sizes-table-body');
                sizesTableBody.innerHTML = '';

                data.sizes.forEach(size => {
                
                    const bRow = document.createElement('tr');
                    sizesTableBody.appendChild(bRow);

                    const itemId = document.createElement('td');
                    itemId.classList.add('table-item-id');
                    itemId.innerText = `${size.id}`;
                    bRow.appendChild(itemId);

                    const itemName = document.createElement('td');
                    itemName.classList.add('table-item-name', 'text-capitalize');
                    itemName.innerText = `${size.name}`;
                    bRow.appendChild(itemName);

                    const currentPrice = document.createElement('td');
                    currentPrice.innerText = `${size.price}`;
                    bRow.appendChild(currentPrice);

                    const newPrice = document.createElement('td');
                    bRow.appendChild(newPrice);

                    const priceInputDiv = document.createElement('div');
                    priceInputDiv.classList.add('price-div');
                    newPrice.appendChild(priceInputDiv);

                    const newPriceInput = document.createElement('input');
                    newPriceInput.classList.add('form-control', 'format-price');
                    newPriceInput.type = 'text';
                    newPriceInput.min = '0';
                    priceInputDiv.appendChild(newPriceInput);

                    const newPriceBtn = document.createElement('button');
                    newPriceBtn.classList.add('btn', 'btn-success', 'new-price-btn');
                    newPriceBtn.innerText = 'Update';
                    newPriceBtn.disabled = true;
                    priceInputDiv.appendChild(newPriceBtn);

                });
            }
        })
        .catch(error => {
            console.error('Error fetching sizes:', error);
        });

    /* RENDER TABLE */
    function createTable(item, tableBody) {
        const bRow = document.createElement('tr');
        tableBody.appendChild(bRow);
    
        const itemId = document.createElement('td');
        itemId.classList.add('table-item-id');
        itemId.innerText = `${item.id}`;
        bRow.appendChild(itemId);
    
        const itemName = document.createElement('td');
        itemName.classList.add('table-item-name');
        itemName.innerText = `${item.name}`;
        bRow.appendChild(itemName);
    
        const currentPrice = document.createElement('td');
        currentPrice.innerText = `${item.price}`;
        bRow.appendChild(currentPrice);
    
        const newPrice = document.createElement('td');
        bRow.appendChild(newPrice);
    
        const priceInputDiv = document.createElement('div');
        priceInputDiv.classList.add('price-div');
        newPrice.appendChild(priceInputDiv);
    
        const newPriceInput = document.createElement('input');
        newPriceInput.classList.add('form-control', 'format-price');
        newPriceInput.type = 'text';
        newPriceInput.min = '0';
        priceInputDiv.appendChild(newPriceInput);
    
        const newPriceBtn = document.createElement('button');
        newPriceBtn.classList.add('btn', 'btn-success', 'new-price-btn');
        newPriceBtn.innerText = 'Update';
        newPriceBtn.disabled = true;
        priceInputDiv.appendChild(newPriceBtn);
    }
}

