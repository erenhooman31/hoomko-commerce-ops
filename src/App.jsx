import { useMemo, useState } from 'react'
import './App.css'

const orders = [
  { id: 'WO-1048', customer: 'سفارش فروشگاه', channel: 'WooCommerce', value: 18400000, status: 'آماده ارسال', sla: '۲ ساعت' },
  { id: 'SH-2091', customer: 'ورودی Shopify', channel: 'Shopify', value: 32600000, status: 'نیازمند بررسی', sla: '۴ ساعت' },
  { id: 'MG-7712', customer: 'همگام سازی Magento', channel: 'Magento', value: 12800000, status: 'بسته بندی', sla: '۱ ساعت' },
  { id: 'WO-1051', customer: 'خرید سازمانی', channel: 'WooCommerce', value: 44200000, status: 'پرداخت شده', sla: '۶ ساعت' },
]

const inventory = [
  { item: 'درگاه پرداخت', score: 96, state: 'سالم' },
  { item: 'سرویس پیامک', score: 82, state: 'نیازمند پایش' },
  { item: 'همگام سازی موجودی', score: 74, state: 'در صف' },
  { item: 'API ارسال', score: 91, state: 'سالم' },
]

function formatMoney(value) {
  return `${Math.round(value / 1000000)} میلیون تومان`
}

function App() {
  const [channel, setChannel] = useState('همه')
  const [selected, setSelected] = useState(orders[0])

  const filteredOrders = useMemo(
    () => (channel === 'همه' ? orders : orders.filter((order) => order.channel === channel)),
    [channel],
  )

  const total = filteredOrders.reduce((sum, order) => sum + order.value, 0)

  return (
    <main className="app-shell" dir="rtl">
      <aside className="sidebar" aria-label="فضای کاری">
        <div className="brand">
          <span className="brand-mark">H</span>
          <div>
            <strong>مرکز فروشگاه</strong>
            <small>داشبورد عملیات فروش آنلاین</small>
          </div>
        </div>
        <nav>
          {['نمای کلی', 'سفارش ها', 'موجودی', 'اتوماسیون', 'گزارش ها'].map((item) => (
            <button className={item === 'سفارش ها' ? 'active' : ''} key={item} type="button">
              {item}
            </button>
          ))}
        </nav>
        <section className="side-card">
          <span>تعهد پاسخ گویی</span>
          <strong>94%</strong>
          <p>پایش پرداخت، ارسال، پیامک و هشدار موجودی در یک نمای واحد.</p>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="label">نمونه کار تعاملی</p>
            <h1>داشبورد مدیریت عملیات فروشگاه اینترنتی</h1>
          </div>
          <button className="primary" type="button" onClick={() => setChannel('همه')}>
            بازنشانی نما
          </button>
        </header>

        <section className="metrics" aria-label="شاخص های فروشگاه">
          <article>
            <span>درآمد فیلتر شده</span>
            <strong>{formatMoney(total)}</strong>
            <small>برای {filteredOrders.length} سفارش فعال</small>
          </article>
          <article>
            <span>اجرای اتوماسیون</span>
            <strong>1,284</strong>
            <small>Webhook و کارهای موجودی در این ماه</small>
          </article>
          <article>
            <span>سلامت پرداخت</span>
            <strong>99.2%</strong>
            <small>بررسی درگاه، سبد خرید و ایمیل</small>
          </article>
        </section>

        <section className="panel-grid">
          <article className="panel orders-panel">
            <div className="panel-head">
            <div>
                <p className="label">صف زنده</p>
                <h2>سفارش ها بر اساس کانال</h2>
              </div>
              <div className="filters">
                {['همه', 'WooCommerce', 'Shopify', 'Magento'].map((item) => (
                  <button
                    className={channel === item ? 'selected' : ''}
                    key={item}
                    onClick={() => setChannel(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="table">
              {filteredOrders.map((order) => (
                <button
                  className={selected.id === order.id ? 'row selected-row' : 'row'}
                  key={order.id}
                  onClick={() => setSelected(order)}
                  type="button"
                >
                  <span>{order.id}</span>
                  <span>{order.customer}</span>
                  <span>{formatMoney(order.value)}</span>
                  <span className="status">{order.status}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="panel detail-panel">
            <p className="label">سفارش انتخاب شده</p>
            <h2>{selected.id}</h2>
            <p>{selected.customer} از مسیر {selected.channel} پردازش می شود و مهلت پاسخ آن {selected.sla} است.</p>
            <div className="steps">
              {['پرداخت تایید شد', 'موجودی رزرو شد', 'پیامک در صف ارسال است', 'برچسب ارسال آماده شد'].map((step, index) => (
                <div className="step" key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel integrations">
          <div className="panel-head">
            <div>
              <p className="label">سلامت سیستم</p>
              <h2>آمادگی اتصال سرویس ها</h2>
            </div>
            <span className="badge">API محور</span>
          </div>
          <div className="health-list">
            {inventory.map((item) => (
              <div className="health-row" key={item.item}>
                <span>{item.item}</span>
                <div className="bar"><i style={{ width: `${item.score}%` }} /></div>
                <strong>{item.state}</strong>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
