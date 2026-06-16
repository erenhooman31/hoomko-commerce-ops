import { useMemo, useState } from 'react'
import './App.css'

const pages = ['نمای کلی', 'سفارش ها', 'موجودی', 'اتوماسیون', 'گزارش ها']

const orders = [
  { id: 'WO-1048', customer: 'سفارش فروشگاه', channel: 'WooCommerce', value: 18400000, status: 'آماده ارسال', sla: '۲ ساعت' },
  { id: 'SH-2091', customer: 'ورودی Shopify', channel: 'Shopify', value: 32600000, status: 'نیازمند بررسی', sla: '۴ ساعت' },
  { id: 'MG-7712', customer: 'همگام سازی Magento', channel: 'Magento', value: 12800000, status: 'بسته بندی', sla: '۱ ساعت' },
  { id: 'WO-1051', customer: 'خرید سازمانی', channel: 'WooCommerce', value: 44200000, status: 'پرداخت شده', sla: '۶ ساعت' },
]

const inventory = [
  { item: 'درگاه پرداخت', score: 96, state: 'سالم', owner: 'Backend' },
  { item: 'سرویس پیامک', score: 82, state: 'نیازمند پایش', owner: 'Automation' },
  { item: 'همگام سازی موجودی', score: 74, state: 'در صف', owner: 'n8n' },
  { item: 'API ارسال', score: 91, state: 'سالم', owner: 'Integration' },
]

const automations = [
  ['پرداخت موفق', 'ارسال پیامک و ایمیل', 'فعال'],
  ['کاهش موجودی', 'هشدار به مدیر فروش', 'فعال'],
  ['سفارش جدید', 'ثبت در CRM', 'پایش'],
  ['مرجوعی کالا', 'ساخت تیکت پشتیبانی', 'آماده'],
]

function formatMoney(value) {
  return `${Math.round(value / 1000000)} میلیون تومان`
}

function MetricCards({ total, count }) {
  return (
    <section className="metrics" aria-label="شاخص های فروشگاه">
      <article>
        <span>درآمد فیلتر شده</span>
        <strong>{formatMoney(total)}</strong>
        <small>برای {count} سفارش فعال</small>
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
  )
}

function OrdersPage({ channel, setChannel, filteredOrders, selected, setSelected }) {
  return (
    <section className="panel-grid">
      <article className="panel orders-panel">
        <div className="panel-head">
          <div>
            <p className="label">صف زنده</p>
            <h2>سفارش ها بر اساس کانال</h2>
          </div>
          <div className="filters">
            {['همه', 'WooCommerce', 'Shopify', 'Magento'].map((item) => (
              <button className={channel === item ? 'selected' : ''} key={item} onClick={() => setChannel(item)} type="button">
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
  )
}

function InventoryPage() {
  return (
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
            <em>{item.owner}</em>
          </div>
        ))}
      </div>
    </section>
  )
}

function AutomationPage() {
  return (
    <section className="panel automation-board">
      <div className="panel-head">
        <div>
          <p className="label">سناریوهای خودکار</p>
          <h2>Workflowهای فروشگاه</h2>
        </div>
        <span className="badge">n8n ready</span>
      </div>
      <div className="automation-list">
        {automations.map(([trigger, action, state]) => (
          <article key={trigger}>
            <span>{trigger}</span>
            <b>{action}</b>
            <em>{state}</em>
          </article>
        ))}
      </div>
    </section>
  )
}

function ReportsPage() {
  return (
    <section className="report-grid">
      {[
        ['نرخ تبدیل checkout', '3.8%', 'بهبود ۰.۶٪ نسبت به هفته قبل'],
        ['میانگین زمان پردازش', '18 دقیقه', 'از پرداخت تا آماده ارسال'],
        ['خطاهای اتصال', '7 مورد', 'همگی در صف بررسی'],
      ].map(([title, value, text]) => (
        <article className="panel report-card" key={title}>
          <span>{title}</span>
          <strong>{value}</strong>
          <p>{text}</p>
        </article>
      ))}
    </section>
  )
}

function App() {
  const [activePage, setActivePage] = useState('نمای کلی')
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
          {pages.map((item) => (
            <button className={activePage === item ? 'active' : ''} key={item} onClick={() => setActivePage(item)} type="button">
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
          <button className="primary" type="button" onClick={() => { setActivePage('نمای کلی'); setChannel('همه') }}>
            بازنشانی نما
          </button>
        </header>

        <MetricCards total={total} count={filteredOrders.length} />

        {activePage === 'نمای کلی' && (
          <>
            <OrdersPage channel={channel} setChannel={setChannel} filteredOrders={filteredOrders} selected={selected} setSelected={setSelected} />
            <InventoryPage />
          </>
        )}
        {activePage === 'سفارش ها' && <OrdersPage channel={channel} setChannel={setChannel} filteredOrders={filteredOrders} selected={selected} setSelected={setSelected} />}
        {activePage === 'موجودی' && <InventoryPage />}
        {activePage === 'اتوماسیون' && <AutomationPage />}
        {activePage === 'گزارش ها' && <ReportsPage />}
      </section>
    </main>
  )
}

export default App
