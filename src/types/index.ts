/**
 * Интерфейс, представляющий продукт в каталоге.
 */
export interface IProduct {
    id: string;                // Уникальный идентификатор продукта
    description: string;       // Описание продукта
    image: string;             // URL изображения продукта
    title: string;             // Название продукта
    category: string;          // Категория продукта
    price: number | null;      // Цена продукта (может быть null)
    selected?: boolean;         // Флаг, указывающий, выбран ли продукт
}

// Карточка товара
export interface ICard extends IProduct {
	buttonText: string;
	itemCount: number | string;
}

// Действия выполняемые с карточкой товара
export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

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

// Отображение корзины
export interface IBasketView {
    items: HTMLElement[];
    total: number | string;
    selected: string[];
}

/**
 * Тип, представляющий карточку продукта в корзине, включающую только необходимые поля.
 */
export type TBasketCard = Pick<IProduct, 'id' | 'title' | 'price'>;

/**
 * Тип, представляющий ошибки формы заказа, где ключи соответствуют полям формы, а значения - сообщениям об ошибках.
 */

// Контакты покупателя
export interface IContactsForm {
    email: string;
    phone: string;
}

export interface IContacts extends IContactsForm {
    items: string[];
}

export interface ISuccessActions {
    onClick: () => void;
}

// Оформление заказа
export interface ISuccess {
    id: string;
    total: number;
}

export type FormErrorsOrder = Partial<Record<keyof IOrder, string>>;
export type FormErrorsContacts = Partial<Record<keyof IContacts, string>>;