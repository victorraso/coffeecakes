document.addEventListener("DOMContentLoaded", () => {

    let sizePrice = 0;

    const itemQuantity = document.querySelectorAll(".item-quantity");

    const updatePrice = (itemName, amountField, priceField, modal) => {
        fetch(`/get-price/${itemName}`)
            .then(response => response.json())
            .then(data => {
                if (data.price) {

                    const itemContainer = priceField.closest('.item-container');
                    const sizePrice = parseFloat(itemContainer.getAttribute('data-size-price')) || 0;

                    const newPrice = (data.price + sizePrice) * parseInt(amountField.value);
                    priceField.textContent = `$${newPrice.toFixed(2)}`;
                    calculateTotal(modal);
                } else {
                    console.log('Error:', data.error);
                }
            })
            .catch(error => console.error('Error fetching price:', error));
    };

    const calculateTotal = (modal) => {
        let itemsSum = 0;

        modal.querySelectorAll('.item-price-field').forEach(priceField => {
            const itemPrice = priceField.textContent.replace('$', '').trim();
            if (itemPrice && !isNaN(parseFloat(itemPrice))) {
                itemsSum += parseFloat(itemPrice);
            }
        });

        const menuTotal = modal.querySelector('.modal-menu-total');
        menuTotal.textContent = `+ $${itemsSum.toFixed(2)}`;
    }

    itemQuantity.forEach(x => {
        const amountField = x.querySelector('.amount-field');
        const priceField = x.closest('.item-container').querySelector('.item-price-field');
        const itemName = x.closest('.item-container').getAttribute('data-item-name');
        const plusBtn = x.querySelector(".plus-btn");
        const minusBtn = x.querySelector(".minus-btn");

        const modal = x.closest('.modal');

        amountField.value = 0;

        plusBtn.addEventListener("click", () => {
            amountField.value = parseInt(amountField.value) + 1;
            updatePrice(itemName, amountField, priceField, modal);
        });

        minusBtn.addEventListener("click", () => {
            const currentValue = parseInt(amountField.value);
            if (currentValue > 0) {
                amountField.value = currentValue - 1;
                updatePrice(itemName, amountField, priceField, modal);
            }
        });
    });

    /* EXTRAs */

    const extraItem = document.querySelectorAll('.extra-menu');

    extraItem.forEach(x => {
        const itemName = x.getAttribute('data-item-name');
        const priceField = x.querySelector('.item-price-field');
        const checkbox = x.querySelector('.form-check-input');

        const modal = x.closest('.modal');

        checkbox.checked = false;

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                fetch(`/get-price/${itemName}`)
                .then(response => response.json())
                /* sugar as 0 was returning undefined */
                .then(data => {
                    if (data && data.price !== undefined && data.price !== null) {
                        if (data.price === 0) {
                            priceField.textContent = 'Free';
                        } else {
                            const newPrice = data.price;
                            priceField.textContent = `$${newPrice.toFixed(2)}`;
                        }
                        calculateTotal(modal);
                    } else {
                        console.log('Error:', data.error);
                    }
                })
                .catch(error => console.error('Error fetching price:', error));
            } else {
                priceField.textContent = `$`;
                calculateTotal(modal);
            }
        });
    });  
    

    /* Sizes */

    const cupSizes = document.querySelectorAll('.cup-size');

    cupSizes.forEach(x => {
        const cupBtn = x.querySelectorAll('.cup-size-btn');
        const defaultBtn = x.querySelector('#small-cup');

        if (defaultBtn) {
            defaultBtn.classList.add('selected');
        }

        const modal = x.closest('.modal');

        cupBtn.forEach(button => {
            button.addEventListener('click', () => {

                cupBtn.forEach(btn => btn.classList.remove('selected'));
    
                button.classList.add('selected');

                const itemContainer = button.closest('.item-container');
                const itemName = itemContainer.getAttribute('data-item-name');
                const amountField = itemContainer.querySelector(".amount-field");
                const priceField = itemContainer.querySelector('.item-price-field');

                if (button.id === 'medium-cup') {
                    const size = 'medium';
                    fetch(`/get-size/${size}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.sizeCost) {
                                itemContainer.setAttribute('data-size-price', data.sizeCost);
                                updatePrice(itemName, amountField, priceField, modal);
                            } else {
                                console.log('Error:', data.error);
                            }
                        })
                        .catch(error => console.error('Error fetching price:', error));
                } else if (button.id === 'large-cup') {
                    const size = 'large';
                    fetch(`/get-size/${size}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.sizeCost) {
                                itemContainer.setAttribute('data-size-price', data.sizeCost);
                                updatePrice(itemName, amountField, priceField, modal);
                            } else {
                                console.log('Error:', data.error);
                            }
                        })
                        .catch(error => console.error('Error fetching price:', error));
                } else {
                    itemContainer.setAttribute('data-size-price', 0);
                    updatePrice(itemName, amountField, priceField, modal);
                }
            });
        });
    });

    /* add through Carousel Cards */

    const carouselItems = document.querySelectorAll('.carousel-item');
    
    carouselItems.forEach(item => {
        const carouselCards = item.querySelectorAll('.card');
        carouselCards.forEach(card => {
            const cardName = card.getAttribute('data-card-name');
            card.addEventListener('click', () => {
                const modalMatch = document.querySelector(`.item-container[data-item-name="${cardName}"]`);
                
                if (modalMatch) {
                    const amountField = modalMatch.querySelector('.amount-field');
                    amountField.value = parseInt(amountField.value) + 1;
                    const priceField = modalMatch.querySelector('.item-price-field');

                    const modal = modalMatch.closest('.modal');

                    updatePrice(cardName, amountField, priceField, modal);
                }
            });
        });
    });

    
});

