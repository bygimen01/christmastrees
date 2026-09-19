import { ArrowLeft, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SmartImage } from "../components/SmartImage/SmartImage";
import { Seo } from "../components/Seo/Seo";
import { formatMoney } from "../config/currency";
import { useShop } from "../context/ShopContext";
import { getOrderApiUrl, shopConfig } from "../config/shopConfig";
import { ATTR_HEIGHT, ATTR_TYPE } from "../data/catalog";
import { copy, getProductTitle, getTypeLabel } from "../i18n/content";
import { CheckoutCustomer, OrderPayload } from "../types";
import { getCartLines } from "../utils/cart";

type Errors = Partial<Record<keyof CheckoutCustomer | "cart" | "api", string>>;

const InitialForm: CheckoutCustomer = {
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  address: "",
  comment: "",
  contactMethod: "telegram"
};

export function CheckoutPage() {
  const { locale, currency, cartItems, clearCart } = useShop();
  const t = copy[locale];
  const Navigate = useNavigate();
  const [Form, setForm] = useState<CheckoutCustomer>(InitialForm);
  const [ErrorsState, setErrors] = useState<Errors>({});
  const [Submitting, setSubmitting] = useState(false);
  const [Website, setWebsite] = useState("");
  const Lines = useMemo(() => getCartLines(cartItems, currency), [cartItems, currency]);
  const Subtotal = Lines.reduce((Sum, Line) => Sum + Line.total, 0);

  const Update = (Field: keyof CheckoutCustomer, Value: string) => {
    setForm((Current) => ({ ...Current, [Field]: Value }));
    setErrors((Current) => ({ ...Current, [Field]: undefined, api: undefined }));
  };

  const Validate = () => {
    const Next: Errors = {};
    const Required: Array<keyof CheckoutCustomer> = ["firstName", "lastName", "phone", "city", "address"];

    Required.forEach((Field) => {
      if (!Form[Field].trim()) Next[Field] = t.checkout.required;
    });

    const PhoneDigits = Form.phone.replace(/\D/g, "");
    if (Form.phone.trim() && PhoneDigits.length < 8) Next.phone = t.checkout.phoneError;
    if (!Lines.length) Next.cart = t.checkout.emptyCart;

    setErrors(Next);
    return Object.keys(Next).length === 0;
  };

  const Submit = async (Event: FormEvent<HTMLFormElement>) => {
    Event.preventDefault();
    if (!Validate()) return;

    const Payload: OrderPayload & { website?: string } = {
      orderId: "pending",
      locale,
      currency,
      customer: Form,
      source: "website",
      website: Website,
      items: Lines.map((Line) => ({
        productId: Line.product.id,
        title: getProductTitle(Line.family.title, locale),
        height: Line.product.attrs?.[ATTR_HEIGHT] ?? "",
        type: getTypeLabel(Line.product.attrs?.[ATTR_TYPE] ?? Line.family.type, locale),
        quantity: Line.item.quantity,
        price: Line.price,
        total: Line.total
      })),
      subtotal: Subtotal
    };

    const OrderApiUrl = getOrderApiUrl();
    if (!OrderApiUrl) {
      setErrors((Current) => ({ ...Current, api: t.checkout.apiError }));
      return;
    }

    setSubmitting(true);
    setErrors((Current) => ({ ...Current, api: undefined }));

    try {
      const Response = await fetch(OrderApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Payload)
      });
      const Result = await Response.json().catch(() => ({ ok: false }));
      if (!Response.ok || !Result.ok || !Result.orderId) throw new Error("ORDER_FAILED");

      clearCart();
      Navigate(`/success/${Result.orderId}`, { state: { orderId: Result.orderId } });
    } catch {
      setErrors((Current) => ({ ...Current, api: t.checkout.apiError }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!Lines.length) {
    return (
      <>
        <Seo title={t.checkout.title} description={t.checkout.text} />
        <section className="checkout-section checkout-empty-section">
          <div className="container checkout-empty empty-state">
            <span className="empty-state-icon"><ShieldCheck size={28} /></span>
            <h1>{t.cart.emptyTitle}</h1>
            <p>{t.checkout.emptyCart}</p>
            <Link className="button primary" to="/catalog">{t.cart.continue}</Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo title={t.checkout.title} description={t.checkout.text} />
      <section className="checkout-section">
        <div className="container checkout-topbar">
          <Link to="/catalog"><ArrowLeft size={16} />{t.cart.continue}</Link>
          <span>{shopConfig.brand.name}</span>
        </div>

        <div className="container checkout-layout">
          <div className="checkout-main">
            <span className="eyebrow">{t.cart.checkout}</span>
            <h1>{t.checkout.title}</h1>
            <p className="checkout-lead">{t.checkout.text}</p>

            <form className="checkout-form" onSubmit={Submit} noValidate>
              <div className="checkout-form-section">
                <div className="form-section-heading">
                  <span>01</span>
                  <div><h2>{t.checkout.customerTitle}</h2><p>{t.checkout.customerText}</p></div>
                </div>
                <div className="form-grid">
                  <Field id="firstName" label={t.checkout.firstName} value={Form.firstName} error={ErrorsState.firstName} autoComplete="given-name" onChange={(Value) => Update("firstName", Value)} />
                  <Field id="lastName" label={t.checkout.lastName} value={Form.lastName} error={ErrorsState.lastName} autoComplete="family-name" onChange={(Value) => Update("lastName", Value)} />
                  <Field id="phone" label={t.checkout.phone} value={Form.phone} error={ErrorsState.phone} inputMode="tel" autoComplete="tel" placeholder="+7 ___ ___ __ __" onChange={(Value) => Update("phone", Value)} />
                  <Field id="city" label={t.checkout.city} value={Form.city} error={ErrorsState.city} autoComplete="address-level2" onChange={(Value) => Update("city", Value)} />
                </div>
                <Field id="address" label={t.checkout.address} value={Form.address} error={ErrorsState.address} autoComplete="street-address" onChange={(Value) => Update("address", Value)} />
              </div>

              <div className="checkout-form-section">
                <div className="form-section-heading">
                  <span>02</span>
                  <div><h2>{t.checkout.contact}</h2><p>{t.checkout.contactText}</p></div>
                </div>
                <fieldset className="contact-methods">
                  <legend className="sr-only">{t.checkout.contact}</legend>
                  {[
                    { value: "telegram" as const, label: t.checkout.telegram, Icon: MessageCircle },
                    { value: "whatsapp" as const, label: t.checkout.whatsapp, Icon: MessageCircle },
                    { value: "phone" as const, label: t.checkout.phoneCall, Icon: Phone }
                  ].map(({ value, label, Icon }) => (
                    <label key={value} className={Form.contactMethod === value ? "is-active" : ""}>
                      <input type="radio" name="contactMethod" value={value} checked={Form.contactMethod === value} onChange={() => Update("contactMethod", value)} />
                      <Icon size={19} aria-hidden="true" />
                      <span>{label}</span>
                    </label>
                  ))}
                </fieldset>

                <label className="field">
                  <span>{t.checkout.comment}</span>
                  <textarea value={Form.comment} rows={4} maxLength={800} placeholder={t.checkout.commentPlaceholder} onChange={(Event) => Update("comment", Event.target.value)} />
                </label>
                <label className="checkout-honeypot" aria-hidden="true">
                  Website
                  <input tabIndex={-1} autoComplete="off" value={Website} onChange={(Event) => setWebsite(Event.target.value)} />
                </label>
              </div>

              {ErrorsState.api && <p className="form-error global-error">{ErrorsState.api}</p>}
              {ErrorsState.cart && <p className="form-error global-error">{ErrorsState.cart}</p>}

              <button className="button primary wide checkout-submit" type="submit" disabled={Submitting}>
                <Send size={18} aria-hidden="true" />
                {Submitting ? t.checkout.submitting : t.checkout.submit}
              </button>
              <p className="checkout-security"><ShieldCheck size={16} />{t.checkout.securityText}</p>
            </form>
          </div>

          <aside className="order-summary">
            <div className="order-summary-heading">
              <span className="eyebrow">{t.checkout.summaryEyebrow}</span>
              <h2>{t.cart.title}</h2>
            </div>
            <div className="summary-lines">
              {Lines.map((Line) => (
                <article key={Line.product.id}>
                  <SmartImage src={Line.family.images[0]} alt={getProductTitle(Line.family.title, locale)} loading="lazy" />
                  <div>
                    <strong>{getProductTitle(Line.family.title, locale)}</strong>
                    <span>{Line.product.attrs?.[ATTR_HEIGHT]} см · ×{Line.item.quantity}</span>
                  </div>
                  <b>{formatMoney(Line.total, currency)}</b>
                </article>
              ))}
            </div>
            <div className="subtotal-row"><span>{t.cart.subtotal}</span><strong>{formatMoney(Subtotal, currency)}</strong></div>
            <p className="order-summary-note">{t.checkout.summaryNote}</p>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({
  id,
  label,
  value,
  error,
  inputMode,
  autoComplete,
  placeholder,
  onChange
}: {
  id: keyof CheckoutCustomer;
  label: string;
  value: string;
  error?: string;
  inputMode?: "tel";
  autoComplete?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={error ? "field has-error" : "field"} htmlFor={id}>
      <span>{label}</span>
      <input id={id} value={value} inputMode={inputMode} autoComplete={autoComplete} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(Event) => onChange(Event.target.value)} />
      {error && <small className="form-error" id={`${id}-error`}>{error}</small>}
    </label>
  );
}
