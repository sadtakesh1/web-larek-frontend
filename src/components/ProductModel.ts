import { IProduct, IProductModel, TBasketCard } from "../types";
import { IEvents } from "./base/events";

export class ProductModel implements IProductModel {
    private catalog: IProduct[] = [];
    private previewId: string | null = null; // Тип изменен на string
    private basket: Set<string> = new Set(); // Тип изменен на string
    private orderTotal: number = 0;

    constructor(protected events: IEvents) { }

    //Устанавливает каталог продуктов и инициирует событие 'catalog: changed'.
    setCatalog(item: IProduct[]) {
        this.catalog = item;
        this.events.emit('catalog: changed', item);
    }

    //Устанавливает продукт для предпросмотра и инициирует событие 'preview: changed'.
    setPreview(id: string) {
        this.previewId = id;
        this.events.emit('preview: changed', { id });
    }
    
    //для проверки с tempData
    getItem(id: string) {
        return this.catalog.find((item) => item.id === id);
    }
    //для проверки с tempData
    getItems() {
        return this.catalog;
    }

    //Добавляет продукт в корзину по идентификатору и инициирует событие 'basket: changed'.
    addProductToBasket(id: string) {
        const product = this.catalog.find(product => product.id === id);
        if (product) {
            this.basket.add(id);
            this.events.emit('basket: changed');
        }
    }

    //Удаляет продукт из корзины по идентификатору и инициирует событие 'basket: changed'.
    removeProductFromBasket(id: string) {
        if (this.basket.has(id)) {
            this.basket.delete(id);
            this.events.emit('basket: changed');
        }
    }

    //Переключает состояние продукта и инициирует событие 'product: stateChanged'.
    toggleProductState(id: string, data: Partial<IProduct>) {
        const product = this.catalog.find(product => product.id === id);
        if (product) {
            Object.assign(product, data);
            this.events.emit('product: stateChanged', { id, data });
        }
    }

    //Проверяет, находится ли продукт в корзине.
    isProductInBasket(id: string) {
        return this.basket.has(id);
    }

    //Возвращает количество продуктов в корзине.
    getBasketCounter() {
        return this.basket.size;
    }

    //Возвращает массив продуктов в корзине.
    getBasketProducts(): TBasketCard[] {
        return Array.from(this.basket).map(id => {
            const product = this.catalog.find(product => product.id === id);
            if (product) {
                return {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                };
            }
            return null;
        }).filter((item): item is TBasketCard => item !== null);
    }

    //Возвращает общую стоимость продуктов в корзине.
    getTotal() {
        return this.getBasketProducts().reduce((total, product) => total + (product.price || 0), 0);
    }

    //Устанавливает общую стоимость заказа и инициирует событие 'order: totalSet'.
    setOrderTotal() {
        this.orderTotal = this.getTotal();
        this.events.emit('order: totalSet', { total: this.orderTotal });
    }

    //Очищает корзину и инициирует событие 'basket: cleared'.
    clearBasket() {
        this.basket.clear();
        this.events.emit('basket: cleared');
    }

    //Устанавливает поля заказа и инициирует событие 'order: fieldSet'.
    setOrderField() {
        // Реализация установки полей заказа
        this.events.emit('order: fieldSet');
    }

    //Проверяет валидность заказа и инициирует событие 'order: validated'.
    validateOrder() {
        const isValid = this.basket.size > 0 && this.orderTotal > 0;
        this.events.emit('order: validated', { isValid });
        return isValid;
    }
    //Проверяет валидность контактной информации и инициирует событие 'contacts: validated'.
    validateContacts() {
        // Реализация валидации контактной информации
        const isValid = true; // Предположим, что валидация успешна для примера
        this.events.emit('contacts: validated', { isValid });
        return isValid;
    }
}