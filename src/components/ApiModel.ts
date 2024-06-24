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
     * @param cdn URL CDN для загрузки изображений.
     * @param baseUrl Базовый URL для API запросов.
     * @param options Дополнительные настройки для fetch.
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
