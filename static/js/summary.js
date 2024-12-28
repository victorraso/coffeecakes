document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.querySelector('.cart-all-items');
    const cartFooter = document.querySelector('.cart-footer');
    const orderBtn = cartFooter.querySelector('.place-order-btn');

    orderBtn.addEventListener('click', () => {
        const cartItems = cartItemsContainer.querySelectorAll('.cart-item-container');
        const itemSummary = {};

        cartItems.forEach(item => {
            let itemName = item.querySelector('.item-in-cart-name').textContent.trim();
            const itemSizeElement = item.querySelector('.cart-item-size');

            if (itemSizeElement) {
                const itemSize = itemSizeElement.textContent.trim();
                itemName += ` - ${itemSize}`; 
            }

            const itemPrice = Math.round(parseFloat(item.querySelector('.cart-item-price').textContent.trim().replace('$', '')) * 100);

            if (!itemSummary[itemName]) {
                itemSummary[itemName] = { quantity: 0, amountPrice: 0 };
            }

            itemSummary[itemName].quantity += 1;
            itemSummary[itemName].amountPrice += itemPrice;
            
        });

        // pass data to payorder page
        sessionStorage.setItem('itemSummary', JSON.stringify(itemSummary));
        // redirect to payorder page
        window.location.href = '/payorder';

    });
    
});