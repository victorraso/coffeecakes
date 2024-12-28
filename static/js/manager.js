document.addEventListener('DOMContentLoaded', () => {

    const defaultLink = document.querySelector('.default-link');
    const defaultUrl = defaultLink.getAttribute('data-url');
    fetchLink(defaultUrl);

    const navLink = document.querySelectorAll('.navbar-nav .nav-link');

    navLink.forEach(x => {
        x.addEventListener('click', function() {
            navLink.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });

            this.classList.add('active');
            this.setAttribute('aria-current', 'page');
        });
    });

    const logoutLink = document.querySelector('#logoutlink');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            window.location.href = logoutLink.getAttribute('href');
        });
    }

});

function fetchLink(url) {
    fetch(url)
            .then(response => response.text())
            .then(code => {
                document.getElementById('content').innerHTML = code;

                if (url === '/manager-sales') {
                    kickstartSales();
                } else if (url === '/manager-prices') {
                    kickstartPrices();
                } else if (url === '/manager-register') {
                    kickstartRegister();
                } 
            })
            .catch(error => console.error('Error loading content:', error));
}

document.querySelectorAll('.nav-item a').forEach(link => {
    link.addEventListener('click', x => {
        x.preventDefault();
        const url = link.getAttribute('data-url');
        fetchLink(url);
    });
});