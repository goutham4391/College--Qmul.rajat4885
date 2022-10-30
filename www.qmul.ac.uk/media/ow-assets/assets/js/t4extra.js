// Desktop Menu
var menuTriggers = document.querySelectorAll('.header__link-secondary');

var closeMegaMenu = document.querySelectorAll('.tabfocus--close');

var skipMegaMenu = document.querySelectorAll('.tabfocus--skip');

// Create overlay while menu is active.
var overlay = document.createElement('div');
overlay.classList.add('qm-overlay');

// Watch for the class change on the parent menu items.
function menuClassChange(mutationList) {

    mutationList.forEach(function(mutation) {

        var elem = mutation.target;
        
        if(!elem.classList.contains('is-active') && mutation.type === 'attributes' && mutation.attributeName === 'class') {
            document.body.removeChild(overlay);
        }
    })
}

var observer = new MutationObserver(menuClassChange);

// Remove any same page jump links from URL
function removeHash(){
    history.replaceState('', document.title, window.location.origin + window.location.pathname + window.location.search);
}

for(var i = 0; i < menuTriggers.length; i++ ) {

    observer.observe(menuTriggers[i], {
        attributes: true
    });

    menuTriggers[i].addEventListener('keydown', function(event) {
        if( event.code === 'Tab' && !event.shiftKey) {
            event.preventDefault();

            this.classList.add('is-active');

            this.nextElementSibling.classList.add('has-active-section');

            document.body.appendChild(overlay);
            
            var anchor = this.href;
        
            var anchorID = anchor.split('#')[1];
        
            var megaMenuItem = document.getElementById(anchorID);
        
            megaMenuItem.classList.add('is-active');
        
            var childMenuItems = megaMenuItem.querySelectorAll('a');

            var firstMenuItem = childMenuItems[0];
        
            firstMenuItem.focus();
        }
    })
}

for(var i = 0; i < closeMegaMenu.length; i++ ) {
    closeMegaMenu[i].addEventListener('keyup', function(event) {
        var headerLogo = document.querySelector('.header__logo');

        if( event.code === 'Enter' ) {
            event.preventDefault();
            this.closest('.primary-nav__section').classList.remove('is-active');
            this.closest('.primary-nav').classList.remove('has-active-section');
            headerLogo.focus();
        }
    })
}

document.addEventListener('keyup', function(event) {
    removeHash();
})


// Mobile Menu 
var mobileMenuTriger = document.querySelector('.header__nav-trigger');
var mobileMenuFirstItem = document.querySelector('.nav-drawer__home');
var mobileMenuLastParentItem = document.querySelector('.primary-nav__section:last-child .primary-nav__section-title a');
var mobileMenuLastItems = document.querySelectorAll('.primary-nav__group:last-child li:last-child a');
var mobileHomeButton = document.querySelector('.nav-drawer__back a');
var mobileCloseButton = document.querySelector('.nav-drawer__close a');

mobileMenuTriger.addEventListener('keyup', function(event) {
    if( (event.code === 'Enter') ) {
        mobileMenuFirstItem.focus();
    }
})

mobileMenuLastParentItem.addEventListener('focusout', function(event) {
    mobileMenuFirstItem.focus();
})

mobileCloseButton.addEventListener('keyup', function(event) {
    if( (event.code === 'Enter') ) {
        mobileMenuTriger.focus();
    }
})

for(var i = 0; i < mobileMenuLastItems.length; i++ ) {
    mobileMenuLastItems[i].addEventListener('focusout', function(event) {
        mobileHomeButton.focus();
    })
}
