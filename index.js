/*==========================================================
=                      INDEX.JS
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initMenuCards();

    initKeyboardNavigation();

    initPageTransition();

});


/*==========================================================
=                 CARDS DO MENU
==========================================================*/

function initMenuCards(){

    const cards = document.querySelectorAll(".menu-card");

    cards.forEach((card, index) => {

        card.style.setProperty(
            "--card-index",
            index
        );

        card.addEventListener("mouseenter", () => {

            card.classList.add("menu-card-hover");

        });

        card.addEventListener("mouseleave", () => {

            card.classList.remove("menu-card-hover");

        });

    });

}


/*==========================================================
=              NAVEGAÇÃO PELO TECLADO
==========================================================*/

function initKeyboardNavigation(){

    const cards = Array.from(
        document.querySelectorAll(".menu-card")
    );

    if(cards.length === 0){

        return;

    }

    let selectedIndex = -1;

    document.addEventListener("keydown", event => {

        if(
            event.key !== "ArrowRight" &&
            event.key !== "ArrowLeft" &&
            event.key !== "ArrowDown" &&
            event.key !== "ArrowUp" &&
            event.key !== "Enter"
        ){

            return;

        }

        if(event.key === "Enter"){

            if(selectedIndex >= 0){

                cards[selectedIndex].click();

            }

            return;

        }

        event.preventDefault();

        if(selectedIndex === -1){

            selectedIndex = 0;

        }

        else if(
            event.key === "ArrowRight" ||
            event.key === "ArrowDown"
        ){

            selectedIndex++;

            if(selectedIndex >= cards.length){

                selectedIndex = 0;

            }

        }

        else if(
            event.key === "ArrowLeft" ||
            event.key === "ArrowUp"
        ){

            selectedIndex--;

            if(selectedIndex < 0){

                selectedIndex = cards.length - 1;

            }

        }

        highlightSelectedCard(
            cards,
            selectedIndex
        );

    });

}


/*==========================================================
=              CARD SELECIONADO
==========================================================*/

function highlightSelectedCard(cards, selectedIndex){

    cards.forEach((card, index) => {

        card.classList.toggle(
            "keyboard-selected",
            index === selectedIndex
        );

    });

    cards[selectedIndex].scrollIntoView({

        behavior:"smooth",

        block:"nearest"

    });

}


/*==========================================================
=              TRANSIÇÃO ENTRE PÁGINAS
==========================================================*/

function initPageTransition(){

    const links = document.querySelectorAll(
        'a[href$=".html"]'
    );

    links.forEach(link => {

        link.addEventListener("click", event => {

            const href = link.getAttribute("href");

            if(!href){

                return;

            }

            event.preventDefault();

            document.body.classList.add(
                "page-leaving"
            );

            setTimeout(() => {

                window.location.href = href;

            }, 180);

        });

    });

}


/*==========================================================
=        CORRIGIR VOLTA PELO NAVEGADOR
==========================================================*/

window.addEventListener("pageshow", () => {

    document.body.classList.remove(
        "page-leaving"
    );

});


/*==========================================================
=                INFORMAÇÕES DO APP
==========================================================*/

window.OrdemApp = {

    version:"0.1.0",

    name:"ORDEM • ECOS DO DESCONHECIDO"

};