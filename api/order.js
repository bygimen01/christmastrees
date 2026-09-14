import RawProducts from "../data/products.js";
import fs from "node:fs";

const ShopConfig = JSON.parse(fs.readFileSync(new URL("../data/shopConfig.json", import.meta.url), "utf8"));

const RequiredCustomerFields = ["firstName", "lastName", "phone", "city", "address"];
const AllowedCurrencies = new Set(["KZT", "RUB"]);
const AllowedContactMethods = new Set(["telegram", "whatsapp", "phone"]);
const RequestWindowMs = 60_000;
const MaxRequestsPerWindow = 6;
const RequestBuckets = new Map();


function ConfigureCors(Request, Response) {
  const Origin = String(Request.headers?.origin ?? "").trim().replace(/\/$/, "");
  const AllowedOrigins = String(process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((Value) => Value.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (!Origin || !AllowedOrigins.length) {
    return true;
  }

  if (!AllowedOrigins.includes("*") && !AllowedOrigins.includes(Origin)) {
    return false;
  }

  Response.setHeader("Access-Control-Allow-Origin", AllowedOrigins.includes("*") ? "*" : Origin);
  Response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  Response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  Response.setHeader("Vary", "Origin");
  return true;
}

function SendJson(Response, Status, Body) {
  Response.statusCode = Status;
  Response.setHeader("Content-Type", "application/json; charset=utf-8");
  Response.end(JSON.stringify(Body));
}

async function ReadJson(Request) {
  if (Request.body) {
    return typeof Request.body === "string" ? JSON.parse(Request.body) : Request.body;
  }

  const Chunks = [];
  let TotalSize = 0;

  for await (const Chunk of Request) {
    TotalSize += Chunk.length;
    if (TotalSize > 32_000) {
      throw new Error("PAYLOAD_TOO_LARGE");
    }
    Chunks.push(Buffer.from(Chunk));
  }

  const Raw = Buffer.concat(Chunks).toString("utf8");
  return Raw ? JSON.parse(Raw) : {};
}

function Sanitize(Value, MaxLength = 160) {
  return String(Value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MaxLength);
}

function GetPrice(Product, Currency) {
  const DirectPrice = Product.prices?.[Currency];
  if (typeof DirectPrice === "number") {
    return DirectPrice;
  }

  const BaseKzt = Product.prices?.KZT ?? Product.price;
  return Currency === "RUB" ? Math.round(BaseKzt * ShopConfig.currency.rubRateFromKzt) : BaseKzt;
}

function FormatMoney(Value, Currency) {
  return new Intl.NumberFormat(Currency === "RUB" ? "ru-RU" : "ru-KZ", {
    style: "currency",
    currency: Currency,
    maximumFractionDigits: 0
  }).format(Number(Value) || 0);
}

function CreateOrderId() {
  const Now = new Date();
  const DatePart = `${String(Now.getUTCFullYear()).slice(-2)}${String(Now.getUTCMonth() + 1).padStart(2, "0")}${String(Now.getUTCDate()).padStart(2, "0")}`;
  const Suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DT-${DatePart}-${Suffix}`;
}

function GetClientKey(Request) {
  const Forwarded = String(Request.headers?.["x-forwarded-for"] ?? "").split(",")[0].trim();
  return Forwarded || String(Request.socket?.remoteAddress ?? "unknown");
}

function IsRateLimited(Request) {
  const Key = GetClientKey(Request);
  const Now = Date.now();
  const Current = RequestBuckets.get(Key);

  if (!Current || Now - Current.startedAt > RequestWindowMs) {
    RequestBuckets.set(Key, { startedAt: Now, count: 1 });
    return false;
  }

  Current.count += 1;
  RequestBuckets.set(Key, Current);
  return Current.count > MaxRequestsPerWindow;
}

function ValidatePayload(Payload) {
  if (!Payload || typeof Payload !== "object") return false;
  if (Sanitize(Payload.website)) return false;
  if (!Payload.customer || !Array.isArray(Payload.items) || !Payload.items.length || Payload.items.length > 20) return false;
  if (!AllowedCurrencies.has(Payload.currency)) return false;
  if (!AllowedContactMethods.has(Payload.customer.contactMethod)) return false;

  const HasRequiredCustomerData = RequiredCustomerFields.every((Field) => Boolean(Sanitize(Payload.customer[Field], 180)));
  if (!HasRequiredCustomerData) return false;

  const PhoneDigits = Sanitize(Payload.customer.phone, 40).replace(/\D/g, "");
  if (PhoneDigits.length < 8 || PhoneDigits.length > 18) return false;

  return Payload.items.every((Item) => {
    const ProductId = Number(Item.productId);
    const Quantity = Number(Item.quantity);
    return Number.isInteger(ProductId) && Number.isInteger(Quantity) && Quantity >= 1 && Quantity <= 99;
  });
}

function BuildOrder(Payload) {
  const Items = Payload.items.map((Item) => {
    const Product = RawProducts.find((Candidate) => Candidate.id === Number(Item.productId));
    if (!Product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const Quantity = Number(Item.quantity);
    if ((Product.stock ?? 0) <= 0 || Quantity > Math.min(Product.stock ?? 0, 99)) {
      throw new Error("INVALID_QUANTITY");
    }

    const Price = GetPrice(Product, Payload.currency);
    return {
      productId: Product.id,
      title: Product.title,
      height: Sanitize(Product.attrs?.["Высота"], 20),
      type: Sanitize(Product.attrs?.["Тип ели"], 100),
      quantity: Quantity,
      price: Price,
      total: Price * Quantity
    };
  });

  return {
    orderId: CreateOrderId(),
    currency: Payload.currency,
    locale: Payload.locale === "kk" ? "kk" : "ru",
    customer: {
      firstName: Sanitize(Payload.customer.firstName, 80),
      lastName: Sanitize(Payload.customer.lastName, 80),
      phone: Sanitize(Payload.customer.phone, 40),
      city: Sanitize(Payload.customer.city, 120),
      address: Sanitize(Payload.customer.address, 220),
      comment: Sanitize(Payload.customer.comment, 800),
      contactMethod: Payload.customer.contactMethod
    },
    items: Items,
    subtotal: Items.reduce((Sum, Item) => Sum + Item.total, 0)
  };
}

function FormatMessage(Order) {
  const Customer = Order.customer;
  const Items = Order.items.map((Item, Index) => `${Index + 1}. ${Item.title}
   Размер: ${Item.height} см
   Тип: ${Item.type}
   Количество: ${Item.quantity}
   Цена: ${FormatMoney(Item.price, Order.currency)}
   Сумма: ${FormatMoney(Item.total, Order.currency)}`).join("\n\n");

  return `НОВЫЙ ЗАКАЗ 🎄

Номер заказа:
${Order.orderId}

Клиент:
Имя: ${Customer.firstName} ${Customer.lastName}
Телефон: ${Customer.phone}
Связь: ${Customer.contactMethod}

Адрес:
Город: ${Customer.city}
Адрес: ${Customer.address}

Товары:

${Items}

Итого:
${FormatMoney(Order.subtotal, Order.currency)}

Валюта:
${Order.currency}

Комментарий:
${Customer.comment || "Без комментария"}

Источник:
website`;
}

export default async function Handler(Request, Response) {
  if (!ConfigureCors(Request, Response)) {
    return SendJson(Response, 403, { ok: false, error: "ORIGIN_NOT_ALLOWED" });
  }

  if (Request.method === "OPTIONS") {
    Response.setHeader("Allow", "POST, OPTIONS");
    return SendJson(Response, 204, {});
  }

  if (Request.method !== "POST") {
    Response.setHeader("Allow", "POST, OPTIONS");
    return SendJson(Response, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  if (IsRateLimited(Request)) {
    return SendJson(Response, 429, { ok: false, error: "RATE_LIMITED" });
  }

  let Payload;
  try {
    Payload = await ReadJson(Request);
  } catch {
    return SendJson(Response, 400, { ok: false, error: "INVALID_JSON" });
  }

  if (!ValidatePayload(Payload)) {
    return SendJson(Response, 422, { ok: false, error: "INVALID_ORDER" });
  }

  let Order;
  try {
    Order = BuildOrder(Payload);
  } catch {
    return SendJson(Response, 422, { ok: false, error: "INVALID_PRODUCT" });
  }

  const DryRun = process.env.TELEGRAM_DRY_RUN === "true";
  const Token = process.env.TELEGRAM_BOT_TOKEN;
  const ChatId = process.env.TELEGRAM_CHAT_ID;

  if (DryRun) {
    return SendJson(Response, 200, { ok: true, dryRun: true, orderId: Order.orderId });
  }

  if (!Token || !ChatId) {
    return SendJson(Response, 503, { ok: false, error: "TELEGRAM_NOT_CONFIGURED" });
  }

  try {
    const TelegramResponse = await fetch(`https://api.telegram.org/bot${Token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ChatId, text: FormatMessage(Order), disable_web_page_preview: true })
    });

    if (!TelegramResponse.ok) {
      return SendJson(Response, 502, { ok: false, error: "TELEGRAM_SEND_FAILED" });
    }

    return SendJson(Response, 200, { ok: true, orderId: Order.orderId });
  } catch {
    return SendJson(Response, 502, { ok: false, error: "TELEGRAM_SEND_FAILED" });
  }
}
