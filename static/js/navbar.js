const navBtns = document.querySelectorAll('.navbar-nav .nav-link');
const sections = document.querySelectorAll('section');

navBtns.forEach(x => {
    x.addEventListener('click', function() {

        navBtns.forEach(nav => nav.classList.remove('active'));

        this.classList.add('active');

        const navNav = document.getElementById('navbarNav');
        const bootShut = new bootstrap.Collapse(navNav, {
            toggle: false
        });
        bootShut.hide();
    });
});

function scrollActive() {
    let currentSection = '';

    sections.forEach((section) => {
        const sectionOffset = section.offsetTop - 57;
        const sectionBottom = sectionOffset + section.offsetHeight;

        if (window.scrollY >= sectionOffset && window.scrollY < sectionBottom) {
            currentSection = section.getAttribute('id');
        }
    });

    navBtns.forEach(y => {
        y.classList.remove('active');
        if (y.getAttribute('href') == `#${currentSection}`) {
            y.classList.add('active');
        }
    });
}

window.addEventListener('scroll', scrollActive);

scrollActive();