'use strict';


const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");

const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const loginForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector(".button-out");

const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');

const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const minPrice = document.querySelector('.price');
const category = document.querySelector('.category');

const inputSearch = document.querySelector('.input-search');

const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');

const buttonClearCart = document.querySelector('.clear-cart');

const cart = [];

let login = localStorage.getItem('login');

const getData = async function(url) {

  const response = await fetch(url);

  if(!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}!`)
  }
  
  return await response.json();
};





const valid = function(str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};




function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleModalAuth() {
  modalAuth.classList.toggle('is-open');
}



function authorized() {

  function logOut() {
    login = null;

    localStorage.removeItem('login');

    buttonAuth.style.display = '';
    userName.style.display = '';
	buttonOut.style.display = '';
	cartButton.style.display = '';

    buttonOut.removeEventListener('click', logOut);

    checkAuth();
    returnMain();
  }

  console.log('Авторизован');

  buttonAuth.style.display = 'none';

  userName.textContent = login;

  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';

  buttonOut.addEventListener('click', logOut)
}

function notAuthorized() {
  console.log('не авторизован');

  function logIn(event) {
    event.preventDefault();
    login = loginInput.value;
    if(valid(login)) {
      localStorage.setItem('login', login);

      toggleModalAuth();
  
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
  
      logInForm.reset();
  
      checkAuth();
    }else {
      alert('Логин введен не правильно');
      loginInput.style.borderColor = 'red';
      loginInput.value = '';
    }

    
  }


  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

function checkAuth() {
  if(login) {
    authorized();
  } else {
    notAuthorized();
  }
}

checkAuth();


function createCardRestaurant(restaurant) {
  const { image, 
          kitchen, 
          name, 
          price, 
          stars, 
          products, 
          time_of_delivery: timeOfDelivery
        } = restaurant;

  
  const card = document.createElement('a');
  card.className = 'card card-restaurant wow zoomInDown';    
  card.products = products;
  card.info = [name, price, stars, kitchen];

  card.insertAdjacentHTML ('beforeend', `
        <img src="${image}" alt="${name}" class="card-image"/>
        <div class="card-text">
          <div class="card-heading">
            <h3 class="card-title">${name}</h3>
            <span class="card-tag tag">${timeOfDelivery} мин</span>
          </div>
          <div class="card-info">
            <div class="rating">
              ${stars}
            </div>
            <div class="price">От ${price} ₽</div>
            <div class="category">${kitchen}</div>
          </div>
        </div>
      `);

cardsRestaurants.insertAdjacentElement('beforeend', card);

}



function createCardGood(goods) {

  const { description,
    id, 
    image,
    name, 
    price
  } = goods;

  const card = document.createElement('div');
  card.className = 'card wow flipInX';
  

  card.insertAdjacentHTML('beforeend', `
      <img src="${image}" alt="${name}" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title card-title-reg">${name}</h3>
        </div>
        <div class="card-info">
          <div class="ingredients">${description}</div>
        </div>
        <div class="card-buttons">
          <button class="button button-primary button-add-cart" id=${id}>
            <span class="button-card-text">В корзину</span>
            <span class="button-cart-svg"></span>
          </button>
          <strong class="card-price-bold">${price} ₽</strong>
        </div>
      </div>
  `);

  cardsMenu.insertAdjacentElement('beforeend', card);
}


function openGoods(event) {
  const target = event.target;
  if(login) {
    const restaurant = target.closest('.card-restaurant');
    
    if(restaurant) {


      const [name, price, stars, kitchen] = restaurant.info;

      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');
  
      restaurantTitle.textContent = name;
      rating.textContent = stars;
      minPrice.textContent = `От ${price} ₽`; 
      category.textContent = kitchen;

      
      getData(`./db/${restaurant.products}`).then(function(data) {
        data.forEach(createCardGood);
      
      });
      
    } 
    
  }else {
    toggleModalAuth();
  }

}

function returnMain() {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');

}


function addToCart(event) {
	const target = event.target;

	const buttonAddToCart = target.closest('.button-add-cart');

	if(buttonAddToCart) {
		const card =  target.closest('.card');
		const title = card.querySelector('.card-title-reg').textContent;
		const cost = card.querySelector('.card-price-bold').textContent;
		const id = buttonAddToCart.id;

		const food = cart.find(function(item){
			return item.id === id;
		})

		if(food){
			food.count += 1;
		}else {
			cart.push({
				id,
				title,
				cost,
				count: 1
			});
		}

		
	}
}

function renderCart() {
	modalBody.textContent = '';

	cart.forEach(function({ id, title, cost, count }) {
		const itemCart = `
		<div class="food-row">
					<span class="food-name">${title}</span>
					<strong class="food-price">${cost}</strong>
					<div class="food-counter">
						<button class="counter-button counter-minus"  data-id=${id}>-</button>
						<span class="counter">${count}</span>
						<button class="counter-button counter-plus"  data-id=${id}>+</button>
					</div>
				</div>
		`;

		modalBody.insertAdjacentHTML('beforeend', itemCart);
	});

	const totalPrice = cart.reduce(function(result, item) {
		return result + (parseFloat(item.cost) * item.count);
	}, 0);

	modalPrice.textContent = totalPrice + ' ₽';
}

function changeCount(event) {
	const target = event.target;

	if(target.classList.contains('counter-button')) {
		const food = cart.find(function(item) {
			return item.id === target.dataset.id;
		});
		if(target.classList.contains('counter-minus')) {	
			food.count--;
			if(food.count === 0) {
				cart.splice(cart.indexOf(food),1)
			}
		}
	
		if(target.classList.contains('counter-plus')){
			food.count++;
		}
		renderCart();
	}


	
}

function init() {
  getData('./db/partners.json').then(function(data) {
    data.forEach(createCardRestaurant);
  
  });
  
  
  cartButton.addEventListener("click", function() {
	  	renderCart();
		toggleModal();
  });

  buttonClearCart.addEventListener('click', function(){
	  cart.length = 0;
	  renderCart();
  })

  modalBody.addEventListener('click', changeCount);

  cardsMenu.addEventListener('click', addToCart);
  
  close.addEventListener("click", toggleModal);
  
  cardsRestaurants.addEventListener('click', openGoods);
  
  logo.addEventListener('click', returnMain);
  
  inputSearch.addEventListener('keydown', function(event) {
    if(event.keyCode === 13) {
      const target = event.target;

		const value = target.value.toLowerCase().trim();

		

		target.value = '';

		if(!value) {
			target.style.backgroundColor = 'tomato';
			setTimeout(function(){
				target.style.backgroundColor = '';
			}, 2000);
			return;
		}

      const goods = [];
      
      getData('./db/partners.json').then(function(data) {

			const products = data.map(function(item){
			return item.products;
			});

			products.forEach(function(product){
				getData(`./db/${product}`).then(function(data){
					goods.push(...data);

					const searchGoods = goods.filter(function(item){
						return item.name.toLowerCase().includes(value)
					});


					cardsMenu.textContent = '';
					containerPromo.classList.add('hide');
					restaurants.classList.add('hide');
					menu.classList.remove('hide');
				
					restaurantTitle.textContent = 'Результат поиска';
					rating.textContent = '';
					minPrice.textContent = ''; 
					category.textContent = '';

					return searchGoods;
				})
				.then(function(data){
					if(data.length){
						data.forEach(createCardGood);
					}else {
						restaurantTitle.textContent = 'Результат поиска: Нет таких товаров!';
					}
					
				})
			})
      });

    }
  });
  
  
  
  
  new Swiper('.swiper', {
    loop: true,
    autoplay: {
      delay: 3000,
    }
  });
}

init();
new WOW().init();