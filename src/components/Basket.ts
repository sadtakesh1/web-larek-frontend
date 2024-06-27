import { Component } from "./base/component";
import { createElement, ensureElement } from "../utils/utils";
import { EventEmitter } from "./base/events";
import { IProduct } from "../types";

import { IBasketView } from "../types";
import { Model } from "./base/model";

export type BasketProductStatus = 'basket' | 'sell';

export class BasketProductItem extends Model<IProduct> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
    status: BasketProductStatus = 'sell';
    itemCount: number;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _deleteButtonEl: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.basket__button');
        this._deleteButtonEl = this.container.querySelector('.basket__item-delete');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        } else if (this._deleteButtonEl) {
            this._deleteButtonEl.addEventListener('click', () => {
                events.emit('item:toggle');
            });
        }

        this.items = [];
    }
    set items(items: HTMLElement[]) {
        if (items.length) {
            this._list.replaceChildren(...items);
        } else {
            this._list.replaceChildren(
                createElement<HTMLParagraphElement>('p', {
                    textContent: 'Корзина пуста',
                })
            );
            // Если корзина пуста, деактивируем кнопку покупки
            this.setDisabled(this._button, true);
        }
    }

    set selected(items: BasketProductItem[]) {
        // Если в корзине есть товары, активируем кнопку покупки
        this.setDisabled(this._button, items.length === 0);
    }

    set total(total: number | string) {
        this.setText(this._total, `${total} синапсов`);
    }

}