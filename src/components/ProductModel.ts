import { IOrder, IProduct, FormErrorsContacts, FormErrorsOrder, IOrderForm, IContactsForm } from "../types";
import { IEvents } from "./base/events";
import { Model } from "./base/model";

export type ProductStatus = 'basket' | 'sell';

export type CatalogChangeEvent = {
	catalog: ProductItem[];
};

export class ProductItem extends Model<IProduct> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
    status: ProductStatus = 'sell';
    itemCount: number;
}

export class ProductModel extends ProductItem {
    basketList: ProductItem[] = [];
    catalog: ProductItem[];
    order: IOrder = {
        address: '',
        items: [],
        email: '',
        phone: '',
        total: 0,
        payment: 'card',
    }
    formErrorsOrder: FormErrorsOrder = {};
    formErrorsContacts: FormErrorsContacts = {};

    setCatalog(items: IProduct[]) {
		this.catalog = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('catalog:install', { catalog: this.catalog });
	}

    //Переключает состояние продукта и инициирует событие.
    toggleBasketList(item: ProductItem) {
        if (item.status === 'sell' && item.price !== null) {
            this.basketList.push(item);
            item.status = 'basket';
            item.itemCount = this.basketList.length;
            this.emitChanges('basket:changed', this.basketList);
        } else if (item.status === 'basket') {
            this.basketList = this.basketList.filter((it) => it !== item);
            item.status = 'sell';
            item.itemCount = this.basketList.length;
            this.emitChanges('basket:changed', this.basketList);
        }
    }

    //Возвращает общую стоимость продуктов в корзине.
    getTotal() {
		return this.basketList.reduce((a, c) => a + c.price, 0);
	}

    //Очищает корзину и инициирует событие 'basket: cleared'.
    clearBasket() {
		this.basketList.forEach((item) => {
			item.status = 'sell';
		});
		this.basketList = [];
	}

    //Устанавливает поля заказа и инициирует событие 'order: fieldSet'.
    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    //Проверяет валидность заказа и инициирует событие 'order: validated'.
    validateOrder() {
        const errors: typeof this.formErrorsOrder = {};

        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrorsOrder = errors;
        this.events.emit('formErrorsOrder:change', this.formErrorsOrder);

        return Object.keys(errors).length === 0;
    }
    //Проверяет валидность контактной информации и инициирует событие 'contacts: validated'.
    validateContacts() {
        const errors: typeof this.formErrorsContacts = {};

        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrorsContacts = errors;
        this.events.emit('formErrorsContacts:change', this.formErrorsContacts);

        return Object.keys(errors).length === 0;
    }

    setContactsField(field: keyof IContactsForm, value: string) {
        this.order[field] = value;
        if (this.validateContacts()) {
            this.events.emit('contacts:ready', this.order);
        }
    }

    getBasketList(): ProductItem[] {
        return this.basketList;
    }
}