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

/**
 * Интерфейс, описывающий методы модели для управления продуктами.
 */
export interface IProductModel {
    // Устанавливает каталог продуктов.
    setCatalog(item: IProduct[]): void;

    // Устанавливает продукт для предпросмотра по его идентификатору.
    setPreview(id: string): void;

    // Добавляет продукт в корзину по его идентификатору с возможностью частичного обновления данных продукта.
    addProductToBasket(id: string, data: Partial<IProduct>): void;

    // Удаляет продукт из корзины по его идентификатору.
    removeProductFromBasket(id: string): void;

    // Переключает состояние продукта по его идентификатору с возможностью частичного обновления данных продукта.
    toggleProductState(id: string, data: Partial<IProduct>): void;

    // Проверяет, находится ли продукт в корзине.
    isProductInBasket(id: string): boolean;

    // Возвращает количество продуктов в корзине.
    getBasketCounter(): number;

    // Возвращает массив продуктов в корзине.
    getBasketProducts(): TBasketCard[];

    // Возвращает общую стоимость продуктов в корзине.
    getTotal(): number;

    // Устанавливает общую стоимость заказа.
    setOrderTotal(): void;

    // Очищает корзину.
    clearBasket(): void;

    // Устанавливает поля заказа.
    setOrderField(): void;

    // Проверяет валидность заказа.
    validateOrder(): boolean;

    // Проверяет валидность контактной информации.
    validateContacts(): boolean;
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

/**
 * Тип, представляющий карточку продукта в корзине, включающую только необходимые поля.
 */
export type TBasketCard = Pick<IProduct, 'id' | 'title' | 'price'>;

/**
 * Тип, представляющий ошибки формы заказа, где ключи соответствуют полям формы, а значения - сообщениям об ошибках.
 */
export type FormErrors = Partial<Record<keyof IOrder, string>>;
