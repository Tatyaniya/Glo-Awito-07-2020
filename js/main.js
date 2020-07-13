'use strict';

const dataBase = JSON.parse(localStorage.getItem('awito')) || [];
//console.log(dataBase);
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

const elementsModalSubmit = [...modalSubmit.elements].filter(elem => elem.tagName !== 'BUTTON' && elem.type !== 'submit');

// записываем даные из формы
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

        if (this === modalAdd) {
            modalSubmit.reset();
            modalImageAdd.src = srcModalImage;
            modalFileBtn.textContent = textFileBtn;
        }
    }
};

const renderCard = () => {
    catalog.textContent = '';

    dataBase.forEach((item, i) => {
        catalog.insertAdjacentHTML('beforeend', `
            <li class="card" data-id="${i}">
                <img class="card__image" src="data: image/jpeg;base64, ${item.image}" alt="test">
                <div class="card__description">
                    <h3 class="card__header">${item.nameItem}</h3>
                    <div class="card__price">${item.costItem} ₽</div>
                </div>
            </li>
        `);
    });
};

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
    console.log(infoPhoto);
});

modalSubmit.addEventListener('input', checkForm);

// собираем данне из формы
modalSubmit.addEventListener('submit', event => {
    event.preventDefault();
    const itemObj = {};

    for (const elem of elementsModalSubmit) {
        itemObj[elem.name] = elem.value;        
    }

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
    if (target.closest('.card')) {
        modalItem.classList.remove('hide');
        document.addEventListener('keydown', closeModal);
    }
});

modalAdd.addEventListener('click', closeModal);
modalItem.addEventListener('click', closeModal);

renderCard();