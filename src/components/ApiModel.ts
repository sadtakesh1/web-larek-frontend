import { IOrder, IProduct, ISuccess } from '../types';
import { Api, ApiListResponse } from './base/api';

/**
 * Интерфейс, описывающий методы API для работы с продуктами и заказами.
 */
export interface IAppApi {
    // Получить список продуктов.
    getProductsList: () => Promise<IProduct[]>;

    orderResult: (order: IOrder) => Promise<ISuccess>;
}

/**
 * Класс, реализующий интерфейс IAppApi для взаимодействия с API.
 */
export class AppApi extends Api {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string) {
		super(baseUrl);
		this.cdn = cdn;
	}

    getProductList(): Promise<IProduct[]> {
		return this.get(`/product`).then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

    orderResult(order: IOrder): Promise<ISuccess> {
		return this.post(`/order`, order).then((data: ISuccess) => data);
	}
}
