document.addEventListener('DOMContentLoaded', () => {

    const cartList = document.querySelector('.cart-ul');
    const cartTotal = document.querySelector('.cart-menu-total-value');

    const updateCartTotal = () => {
        let total = 0;

        cartList.querySelectorAll('.cart-item-container').forEach(item => {
            const itemPrice = item.querySelector('.cart-item-price').textContent.replace('$', '').trim();
            total += parseFloat(itemPrice);
        });

        cartTotal.textContent = `$${total.toFixed(2)}`;
    };

    const removeCartItem = (item) => {
        item.remove();
        updateCartTotal();
    };

    const addToCartBtn = document.querySelectorAll('.addtocart-btn');

    addToCartBtn.forEach(x => {
        x.addEventListener('click', () => {

            const modal = x.closest('.modal');

            /* handles items */
            const modalItems = modal.querySelectorAll('.item-container');

            modalItems.forEach(item => {

                const itemImg = item.querySelector('img').src;
                const itemName = item.getAttribute('data-item-name');

                const itemSizeElement = item.querySelector('.cup-size-btn.selected');
                const itemSize = itemSizeElement ? itemSizeElement.textContent.trim() : null;

                const itemAmountField = item.querySelector('.amount-field');
                const itemQuantity = parseInt(itemAmountField.value);
                const priceField = item.querySelector('.item-price-field');
                const quantityPrice = parseFloat(priceField.textContent.replace('$', '').trim());

                const itemPrice = quantityPrice / itemQuantity;

                if (itemAmountField.value > 0) {
                    
                    for (let i = 0; i < itemQuantity; i++) {
                        
                        const cartItem = document.createElement('li');
                        cartItem.classList.add('list-group-item', 'cart-item-container');
    
                        const cartItemLeft = document.createElement('div');
                        cartItemLeft.classList.add('cart-item-left');
                        cartItem.appendChild(cartItemLeft);
    
                        const cartItemImg = document.createElement('img');
                        cartItemImg.src = itemImg;
                        cartItemLeft.appendChild(cartItemImg);
    
                        const cartItemNameDiv = document.createElement('div');
                        cartItemNameDiv.classList.add('me-4');
                        cartItemLeft.appendChild(cartItemNameDiv);
    
                        const cartItemName = document.createElement('strong');
                        cartItemNameDiv.appendChild(cartItemName);
                        cartItemName.classList.add('item-in-cart-name');
                        cartItemName.textContent = `${itemName}`;
    
                        const cartItemMid = document.createElement('div');
                        cartItemMid.classList.add('cart-item-mid');
                        cartItem.appendChild(cartItemMid);
                        
                        if (itemSize) {
                            const cartItemSize = document.createElement('p');
                            cartItemMid.appendChild(cartItemSize);
                            cartItemSize.classList.add('cart-item-size');
                            cartItemSize.textContent = `${itemSize}`;
                        }
    
                        const cartItemPrice = document.createElement('p');
                        cartItemMid.appendChild(cartItemPrice);
                        cartItemPrice.classList.add('cart-item-price');
                        cartItemPrice.textContent = `$${itemPrice.toFixed(2)}`;
    
                        const cartItemRight = document.createElement('div');
                        cartItemRight.classList.add('cart-item-right');
                        cartItem.appendChild(cartItemRight);
                        
                        const cartItemRemoveBtn = document.createElement('button');
                        cartItemRight.appendChild(cartItemRemoveBtn);
                        cartItemRemoveBtn.textContent = 'X';
    
                        cartList.appendChild(cartItem);

                        cartItemRemoveBtn.addEventListener('click', () => {
                            removeCartItem(cartItem);
                        });

                        updateCartTotal();
                        successModal();

                    }
                }

                /* Reset Items */
                itemAmountField.value = 0;
                priceField.textContent = '$';
                const cupSize = item.querySelectorAll('.cup-size-btn');
                cupSize.forEach(x => x.classList.remove('selected'));
                const defaultCup = item.querySelector('#small-cup');
                if (defaultCup) {
                    defaultCup.classList.add('selected');
                }
            });

            /* handles the extras */
            const modalExtras = modal.querySelectorAll('.extra-menu');

            modalExtras.forEach(extra => {

                const extraCheckBox = extra.querySelector('.form-check-input');
                const extraName = extra.querySelector('.form-check-label').textContent;
                const extraPrice = extra.querySelector('.item-price-field').textContent;

                if (extraCheckBox.checked) {

                    const cartItem = document.createElement('li');
                    cartItem.classList.add('list-group-item', 'cart-item-container');

                    const cartItemLeft = document.createElement('div');
                    cartItemLeft.classList.add('cart-item-left');
                    cartItem.appendChild(cartItemLeft);

                    const cartItemNameDiv = document.createElement('div');
                    cartItemNameDiv.classList.add('me-4');
                    cartItemLeft.appendChild(cartItemNameDiv);

                    const cartItemKind = document.createElement('strong');
                    cartItemNameDiv.appendChild(cartItemKind);
                    cartItemKind.style.marginRight = '8px';
                    cartItemKind.textContent = `Extra:`;

                    const cartItemName = document.createElement('span');
                    cartItemNameDiv.appendChild(cartItemName);
                    cartItemName.classList.add('item-in-cart-name');
                    cartItemName.textContent = `${extraName}`;

                    const cartItemMid = document.createElement('div');
                    cartItemMid.classList.add('cart-item-mid');
                    cartItem.appendChild(cartItemMid);

                    const cartItemPrice = document.createElement('p');
                    cartItemMid.appendChild(cartItemPrice);
                    cartItemPrice.classList.add('cart-item-price');
                    cartItemPrice.style.marginLeft = '30px';

                    if (extraPrice === 'Free') {
                        cartItemPrice.textContent = '$0.00';
                    } else {
                        cartItemPrice.textContent = extraPrice;
                    }

                    const cartItemRight = document.createElement('div');
                    cartItemRight.classList.add('cart-item-right');
                    cartItem.appendChild(cartItemRight);
                    
                    const cartItemRemoveBtn = document.createElement('button');
                    cartItemRight.appendChild(cartItemRemoveBtn);
                    cartItemRemoveBtn.textContent = 'X';

                    cartList.appendChild(cartItem);

                    cartItemRemoveBtn.addEventListener('click', () => {
                        removeCartItem(cartItem);
                    });

                    updateCartTotal();
                    successModal();
                }

                /* Reset Extras */
                extraCheckBox.checked = false;
                const priceField = extra.querySelector('.item-price-field');
                priceField.textContent = '$';
            });

            /* Reset Total */
            const modalTotal = modal.querySelector('.modal-menu-total');
            modalTotal.textContent = `+ $`;

            /* Close Modal */
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();

            /* Success Modal */
            function successModal() {
                const succModal =  new bootstrap.Modal(document.getElementById('success-modal'));
                succModal.show();
                setTimeout(() => {
                    succModal.hide();
                }, 1500);
            };  
        });
    });
});