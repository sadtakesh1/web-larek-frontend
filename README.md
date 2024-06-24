# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
# Документация

## Типы данных/интерфейсы
```
/**
 * Интерфейс, представляющий заказ.
 */
export interface IOrder {
    payment: string;     // Способ оплаты
    email: string;       // Электронная почта клиента
    phone: string;       // Телефон клиента
    address: string;     // Адрес доставки
    total: number;       // Общая стоимость заказа
    items: string[];     // Список идентификаторов продуктов в заказе
}

/**
 * Интерфейс формы заказа, используемый для сбора данных клиента.
 */
export interface IOrderForm {
    payment: string;     // Способ оплаты
    address: string;     // Адрес доставки
    email: string;       // Электронная почта клиента
    phone: string;       // Телефон клиента
}

/**
 * Интерфейс, представляющий результат отправки заказа.
 */
export interface IOrderResult {
    id: number;          // Идентификатор заказа
    total: number;       // Общая стоимость заказа
}

/**
 * Тип, представляющий карточку продукта в корзине, включающую только необходимые поля.
 */
export type TBasketCard = Pick<IProduct, 'id' | 'title' | 'price'>;

/**
 * Тип, представляющий ошибки формы заказа, где ключи соответствуют полям формы, а значения - сообщениям об ошибках.
 */
export type FormErrors = Partial<Record<keyof IOrder, string>>;
```

## Модели для работы с данными
### Модель которая описывает практически весь функционал для работы с продуктом 
```
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
```
### Модель которая отвечает за работу с api
```
import { IOrder, IProduct, IOrderResult } from '../types';
import { Api, ApiListResponse } from './base/api';

/**
 * Интерфейс, описывающий методы API для работы с продуктами и заказами.
 */
export interface IAppApi {
    // Получить список продуктов.
    getProductsList: () => Promise<IProduct[]>;

    // Получить информацию о продукте по идентификатору.
    getProductItem: (id: string) => Promise<IProduct>;

    // Отправить заказ и получить результат.
    postOrder: (order: IOrder) => Promise<IOrderResult>;
}

/**
 * Класс, реализующий интерфейс IAppApi для взаимодействия с API.
 */
export class AppApi extends Api implements IAppApi {
    readonly cdn: string;

    /**
     * Конструктор класса AppApi.
     * cdn URL CDN для загрузки изображений.
     * baseUrl Базовый URL для API запросов.
     * options Дополнительные настройки для fetch.
     */
    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    /**
     * Получает список продуктов с API и добавляет к каждому продукту полный URL изображения.
     * Возвращает промис, который разрешается в массив продуктов.
     */
    getProductsList(): Promise<IProduct[]> {
        return this.get('/product').then((data) =>
            (data as ApiListResponse<IProduct>).items.map((item) => ({
                ...item,
                image: this.cdn + item.image,
            }))
        );
    }

    /**
     * Получает информацию о конкретном продукте по его идентификатору с API
     * и добавляет полный URL изображения.
     * Возвращает промис, который разрешается в продукт.
     */
    getProductItem(id: string): Promise<IProduct> {
        return this.get(`/product/${id}`).then((item: IProduct) => ({
            ...item,
            image: this.cdn + item.image,
        }));
    }

    /**
     * Отправляет заказ на сервер и возвращает результат заказа.
     * Возвращает промис, который разрешается в результат заказа.
     */
    postOrder(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order).then((data: IOrderResult) => data);
    }
}
```

