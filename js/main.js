'use strict';

const dataBase = JSON.parse(localStorage.getItem('awito')) || [];

const modalAdd = document.querySelector('.modal__add');
const addAd = document.querySelector('.add__ad');
const modalBtnSubmit = document.querySelector('.modal__btn-submit');
const modalSubmit = document.querySelector('.modal__submit');
const catalog = document.querySelector('.catalog');
const modalItem = document.querySelector('.modal__item');
const modalBtnWarning = document.querySelector('.modal__btn-warning');
const modalFileInput = document.querySelector('.modal__file-input');
const modalFileBtn = document.querySelector('.modal__file-btn');
const modalImageAdd = document.querySelector('.modal__image-add');

// текст и картинка в модальном окне при добавлении объявления
const textFileBtn = modalFileBtn.textContent;
const srcModalImage = modalImageAdd.src;

// модалка карточки товара
const modalImageItem = document.querySelector('.modal__image-item');
const modalHeaderItem = document.querySelector('.modal__header-item');
const modalStatusItem = document.querySelector('.modal__status-item');
const modalDescriptionItem = document.querySelector('.modal__description-item');
const modalCostItem = document.querySelector('.modal__cost-item');
const buyBtn = document.querySelector('.buy-btn');

// поиск
const searchInput = document.querySelector('.search__input');

// категории
const menuContainer = document.querySelector('.menu__container');

const elementsModalSubmit = [...modalSubmit.elements].filter(elem => elem.tagName !== 'BUTTON' && elem.type !== 'submit');

// записываем данные из формы
const saveDB = () => localStorage.setItem('awito', JSON.stringify(dataBase));

// если заполнены все поля формы, удаляем надпись и активируем кнопку
const checkForm = () => {
    const validForm = elementsModalSubmit.every(elem => elem.value);
    modalBtnSubmit.disabled = !validForm;
    modalBtnWarning.style.display = validForm ? 'none' : '';
}

// закрытие модалок
const closeModal = function(event) {
    const target = event.target;

    if (target.closest('.modal__close') || target.classList.contains('modal') || event.code  === 'Escape') {
        modalAdd.classList.add('hide');
        modalItem.classList.add('hide');
        document.removeEventListener('keydown', closeModal);
        modalSubmit.reset();
        checkForm();
        modalSubmit.reset();
        modalImageAdd.src = srcModalImage;
        modalFileBtn.textContent = textFileBtn;
    }
};

const renderCard = (DB = dataBase) => {
    catalog.textContent = '';

    DB.forEach((item) => {
        catalog.insertAdjacentHTML('beforeend', `
            <li class="card" data-id="${item.id}">
                <img class="card__image" src="data: image/jpeg;base64, ${item.image}" alt="test">
                <div class="card__description">
                    <h3 class="card__header">${item.nameItem}</h3>
                    <div class="card__price">${item.costItem} ₽</div>
                </div>
            </li>
        `);
    });
};

// поиск
searchInput.addEventListener('input', () => {
    const valueSearch = searchInput.value.trim().toLowerCase();

    if (valueSearch.length > 2) {
        const result = dataBase.filter(item => item.nameItem.toLowerCase().includes(valueSearch) || item.descriptionItem.toLowerCase().includes(valueSearch));
        renderCard(result);
    } else if (valueSearch.length == 0) {
        renderCard();
    }
});

// добавление картинок
const infoPhoto = {};

modalFileInput.addEventListener('change', event => {
    const target = event.target;
    const reader = new FileReader();
    const file = target.files[0];

    infoPhoto.name = file.name;
    infoPhoto.size = file.size;

    reader.readAsBinaryString(file);
    reader.addEventListener('load', event => {
        if (infoPhoto.size < 200000) {
            modalFileBtn.textContent = infoPhoto.name;
            // конвертируем картинку в строку
            infoPhoto.base64 = btoa(event.target.result);
            modalImageAdd.src = `data: image/jpeg;base64, ${infoPhoto.base64}`;
        } else {
            modalFileBtn.textContent = 'Размер файла не должен превышать 200кб';
            modalFileInput.value = '';
            checkForm();
        }
        
    });
});

modalSubmit.addEventListener('input', checkForm);

// собираем данные из формы
let counter = dataBase.length;

modalSubmit.addEventListener('submit', event => {
    event.preventDefault();
    const itemObj = {};

    for (const elem of elementsModalSubmit) {
        itemObj[elem.name] = elem.value;
    }

    itemObj.id = counter++; 
    itemObj.image = infoPhoto.base64;
    dataBase.push(itemObj);
    closeModal({target: modalAdd});
    saveDB();
    renderCard();
});

// кнопка "подать объявление"
addAd.addEventListener('click', () => {
    modalAdd.classList.remove('hide');
    modalBtnSubmit.disabled = true;
    document.addEventListener('keydown', closeModal);
});

// карточка товара
catalog.addEventListener('click', event => {
    const target = event.target;
    const card = target.closest('.card');

    if (card) {
        const item = dataBase.find(item => item.id === +card.dataset.id);
        modalImageItem.src = `data: image/jpeg;base64, ${item.image}`;
        modalHeaderItem.textContent = item.nameItem;
        modalStatusItem.textContent = item.status === 'new' ? 'Новый' : 'Б/У';
        modalDescriptionItem.textContent = item.descriptionItem;
        modalCostItem.textContent = item.costItem;
        buyBtn
        modalItem.classList.remove('hide');
        document.addEventListener('keydown', closeModal);
    }
});

// категории
menuContainer.addEventListener('click', event => {
    const target = event.target;

    if (target.tagName === 'A') {
        const result = dataBase.filter(item => item.category === target.dataset.category);

        renderCard(result);
    }
});

modalAdd.addEventListener('click', closeModal);
modalItem.addEventListener('click', closeModal);

renderCard();