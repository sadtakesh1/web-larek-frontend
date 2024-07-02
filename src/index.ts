//Этот код представляет собой основной скелет для веб-приложения, которое управляет каталогом продуктов, корзиной, заказами и контактной информацией с использованием событийной модели.

//Импорт стилей
import './scss/styles.scss';

//Импортирует различные компоненты и утилиты, используемые в проекте
import { Page } from './components/Page';
import { PaymentMethods, categoryColour } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { ProductModel, ProductItem } from './components/ProductModel';
import { Card } from './components/Card';
import { AppApi } from './components/ApiModel';
import { API_URL, CDN_URL } from './utils/constants';
import { IContactsForm, IOrder, IOrderForm } from './types';
import { Modal } from './components/common/Modal';
import { Basket } from './components/Basket';
import { OrderForm } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/base/success';

//Создание экземпляров классов и переменных:
const events = new EventEmitter();

//Создает экземпляр класса EventEmitter для управления событиями в приложении
const api = new AppApi(CDN_URL, API_URL);

//Создает экземпляр класса AppApi для взаимодействия с API.
const appData = new ProductModel({}, events);

//Инициализирует HTML-шаблоны, которые будут клонированы и использованы для отображения различных частей интерфейса.
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

//Создает экземпляры различных компонентов, таких как Page, Modal, Basket, OrderForm и Contacts.
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events, {
	onClick: (evt: Event) => events.emit('payment:toggle', evt.target),
});
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

//Устанавливает обработчик события для установки каталога продуктов на страницу.
events.on('catalog:install', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		});
	});
});

//Обрабатывает выбор продукта для отображения его подробной информации в модальном окне.
events.on('card:select', (item: ProductItem) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		// Удалить или добавить товар в корзину
		onClick: () => {
			events.emit('item:toggle', item);
			page.counter = appData.getBasketList().length;
			card.buttonText = item.status;
		},
	});
	return modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
			buttonText: item.status,
		}),
	});
});

//Обрабатывает открытие модального окна.
events.on('modal:open', () => {
	page.locked = true;
});

//Обрабатывает закрытие модального окна
events.on('modal:close', () => {
	page.locked = false;
});

//Обрабатывает открытие корзины с продуктами
events.on('basket:open', () => {
	basket.items = appData.getBasketList().map((item, index) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('item:toggle', item);
			},
		});
		card.index = (index + 1).toString();
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	page.counter = appData.getBasketList().length;
	basket.selected = appData.getBasketList();
	basket.total = appData.getTotal();
	appData.order.total = appData.getTotal();
	return modal.render({
		content: basket.render(),
	});
});

//Обрабатывает добавление или удаление продукта из корзины.
events.on('item:toggle', (item: ProductItem) => {
	appData.toggleBasketList(item);

	page.counter = appData.getBasketList().length;
});

//Обрабатывает изменение содержимого корзины.
events.on('basket:changed', (items: ProductItem[]) => {
	basket.items = items.map((item, index) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('item:toggle', item);
			},
		});
		card.index = (index + 1).toString();
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	appData.order.total = appData.getTotal();
	basket.total = appData.getTotal();
});

//Обрабатывает открытие формы заказа.
events.on('order:open', () => {
	modal.render({
		content: order.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

//Обрабатывает выбор способа оплаты.
events.on('payment:toggle', (name: HTMLElement) => {
	if (!name.classList.contains('button_alt-active')) {
		order.selectPaymentMethod(name);
		appData.order.payment = PaymentMethods[name.getAttribute('name')];
	}
});

//Обрабатывает изменение полей формы заказа.
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

//Обрабатывает изменение ошибок в форме заказа.
events.on('formErrorsOrder:change', (errors: Partial<IOrder>) => {
	const { address } = errors;
	order.valid = !address;
	order.errors = Object.values({ address }).filter(Boolean).join('; ');
});

//Обрабатывает отправку формы заказа.
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
	appData.order.items = appData.basketList.map((item) => item.id);
});

//Обрабатывает изменение полей формы контактов.
events.on(
	/^contacts\.[^:]*:change/,
	(data: { field: keyof IContactsForm; value: string }) => {
		appData.setContactsField(data.field, data.value);
	}
);

//Обрабатывает изменение ошибок в форме контактов.
events.on('formErrorsContacts:change', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone }).filter(Boolean).join('; ');
});

//Обрабатывает отправку формы контактов.
events.on('contacts:submit', () => {
	api
		.orderResult(appData.order)
		.then((result) => {
			appData.clearBasket();
			page.counter = appData.getBasketList().length;
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});
			success.total = result.total;

			modal.render({
				content: success.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});
//Загружает список продуктов из API и устанавливает каталог продуктов в appData
api
	.getProductList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});