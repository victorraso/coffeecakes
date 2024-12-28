document.addEventListener('DOMContentLoaded', () => {
    const summaryUL = document.querySelectorAll('.summary-ul');
    const itemSummary = JSON.parse(sessionStorage.getItem('itemSummary'));

    let totalPrice = 0;

    if (itemSummary) {
        for (const [name, { quantity, amountPrice }] of Object.entries(itemSummary)) {

            summaryUL.forEach(ul => {
                
                const summaryItem = document.createElement('li');
                summaryItem.classList.add('list-group-item', 'summary-item-container');
    
                const itemAmount = document.createElement('span');
                summaryItem.appendChild(itemAmount);
                itemAmount.classList.add('summary-item-amount');
                itemAmount.textContent = `${quantity}x`;
    
                const itemName = document.createElement('span');
                summaryItem.appendChild(itemName);
                itemName.classList.add('summary-item-name');
                itemName.textContent = `${name}`;
    
                const itemPrice = document.createElement('span');
                summaryItem.appendChild(itemPrice);
                itemPrice.classList.add('summary-item-price');
                itemPrice.textContent = `$${(amountPrice / 100).toFixed(2)}`;
    
                ul.appendChild(summaryItem);
            });

            totalPrice += amountPrice;
        }

        const summaryTotalValue = document.querySelectorAll('.summary-total-value');

        summaryTotalValue.forEach(total => {
            total.textContent = `$${(totalPrice / 100).toFixed(2)}`;
        });
    }
});