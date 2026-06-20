import { useEffect, useMemo, useState } from 'react'
import './App.css'

const pages = ['نمای کلی', 'سفارش ها', 'موجودی', 'اتوماسیون', 'گزارش ها']
const orderStages = ['بررسی', 'آماده ارسال', 'پیامک ارسال شد', 'تکمیل']

const orders = [
  { id: 'WO-1048', customer: 'سفارش فروشگاه', channel: 'WooCommerce', value: 18400000, status: 'آماده ارسال', sla: '۲ ساعت', risk: 'کم' },
  { id: 'SH-2091', customer: 'ورودی Shopify', channel: 'Shopify', value: 32600000, status: 'نیازمند بررسی', sla: '۴ ساعت', risk: 'متوسط' },
  { id: 'MG-7712', customer: 'همگام سازی Magento', channel: 'Magento', value: 12800000, status: 'بسته بندی', sla: '۱ ساعت', risk: 'کم' },
  { id: 'WO-1051', customer: 'خرید سازمانی', channel: 'WooCommerce', value: 44200000, status: 'پرداخت شده', sla: '۶ ساعت', risk: 'بالا' },
]

const inventory = [
  { item: 'درگاه پرداخت', score: 96, state: 'سالم', owner: 'Backend', fix: 'پایش خطای Callback و ثبت دوباره پرداخت های معلق' },
  { item: 'سرویس پیامک', score: 82, state: 'نیازمند پایش', owner: 'Automation', fix: 'صف پیامک و Retry برای سفارش های پرداخت شده' },
  { item: 'همگام سازی موجودی', score: 74, state: 'بحرانی', owner: 'n8n', fix: 'Sync دوطرفه موجودی با قفل سفارش در لحظه پرداخت' },
  { item: 'API ارسال', score: 91, state: 'سالم', owner: 'Integration', fix: 'ثبت Tracking code و اطلاع رسانی خودکار' },
]

const automations = [
  ['پرداخت موفق', 'ارسال پیامک و ایمیل', 'فعال'],
  ['کاهش موجودی', 'هشدار به مدیر فروش', 'فعال'],
  ['سفارش جدید', 'ثبت در CRM', 'پایش'],
  ['مرجوعی کالا', 'ساخت تیکت پشتیبانی', 'آماده'],
]

const diagnostics = [
  {
    key: 'payment',
    title: 'افت پرداخت',
    impact: '۳ سفارش با پرداخت ناموفق در ۲۴ ساعت اخیر',
    fix: 'Webhook پرداخت را با شناسه سفارش ذخیره کن و برای پرداخت های ناموفق لینک پرداخت جدید بساز.',
  },
  {
    key: 'stock',
    title: 'موجودی ناهماهنگ',
    impact: '۲ کالا در خطر فروش بیشتر از موجودی واقعی',
    fix: 'موجودی را بعد از پرداخت قفل کن و Sync با انبار را هر ۱۵ دقیقه اجرا کن.',
  },
  {
    key: 'sms',
    title: 'تاخیر پیامک',
    impact: '۷ پیامک وضعیت سفارش در صف مانده',
    fix: 'برای Provider پیامک Retry مرحله ای و مسیر جایگزین ایمیل فعال کن.',
  },
  {
    key: 'checkout',
    title: 'ریزش Checkout',
    impact: 'نرخ تبدیل امروز ۰.۶٪ کمتر از هدف است',
    fix: 'خطای فرم آدرس، هزینه ارسال و زمان پاسخ درگاه را جداگانه لاگ کن.',
  },
]

function formatMoney(value) {
  return `${Math.round(value / 1000000)} میلیون تومان`
}

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  function updateValue(nextValue) {
    setValue((current) => {
      const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue
      window.localStorage.setItem(key, JSON.stringify(resolved))
      return resolved
    })
  }

  return [value, updateValue]
}

function useApiStatus(path) {
  const [status, setStatus] = useState({ state: 'در حال بررسی', detail: 'اتصال API در حال تست است.' })

  useEffect(() => {
    let ignore = false
    fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error('API unavailable')
        return response.json()
      })
      .then((payload) => {
        if (!ignore) setStatus({ state: 'فعال', detail: `${payload.service} - ${payload.capabilities.join('، ')}` })
      })
      .catch(() => {
        if (!ignore) setStatus({ state: 'دموی محلی', detail: 'در محیط لوکال UI با داده امن اجرا می شود؛ روی Vercel API زنده فعال است.' })
      })
    return () => {
      ignore = true
    }
  }, [path])

  return status
}

function Toast({ message }) {
  return message ? <div className="toast" role="status">{message}</div> : null
}

function MetricCards({ total, count, stagedOrders }) {
  const pending = stagedOrders.filter((stage) => stage !== 'تکمیل').length
  return (
    <section className="metrics" aria-label="شاخص های فروشگاه">
      <article>
        <span>فروش امروز</span>
        <strong>{formatMoney(total)}</strong>
        <small>برای {count} سفارش فعال</small>
      </article>
      <article>
        <span>سفارش های معطل</span>
        <strong>{pending}</strong>
        <small>نیازمند پیگیری تا قبل از پایان SLA</small>
      </article>
      <article>
        <span>خطای پرداخت</span>
        <strong>۳</strong>
        <small>قابل بازیابی با لینک پرداخت دوباره</small>
      </article>
      <article>
        <span>موجودی بحرانی</span>
        <strong>۲ کالا</strong>
        <small>نیازمند Sync و هشدار مدیر فروش</small>
      </article>
    </section>
  )
}

function OrderWorkflow({ selected, orderState, setOrderState, notify }) {
  const currentStage = orderState[selected.id] || orderStages[0]
  const currentIndex = orderStages.indexOf(currentStage)

  function setStage(stage) {
    setOrderState((current) => ({ ...current, [selected.id]: stage }))
    notify(`وضعیت ${selected.id} به «${stage}» تغییر کرد.`)
  }

  return (
    <article className="panel detail-panel">
      <p className="label">سفارش انتخاب شده</p>
      <div className="detail-title">
        <h2>{selected.id}</h2>
        <span className="status">{currentStage}</span>
      </div>
      <p>{selected.customer} از مسیر {selected.channel} پردازش می شود و مهلت پاسخ آن {selected.sla} است.</p>
      <div className="steps">
        {orderStages.map((stage, index) => (
          <button
            className={index <= currentIndex ? 'step done' : 'step'}
            key={stage}
            onClick={() => setStage(stage)}
            type="button"
          >
            <span>{index + 1}</span>
            <p>{stage}</p>
          </button>
        ))}
      </div>
      <div className="action-row">
        <button className="secondary" onClick={() => setStage('پیامک ارسال شد')} type="button">ارسال پیامک</button>
        <button className="primary small" onClick={() => setStage('تکمیل')} type="button">تکمیل سفارش</button>
      </div>
    </article>
  )
}

function OrdersPage({ channel, setChannel, filteredOrders, selected, setSelected, orderState, setOrderState, notify }) {
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
              <span className="status">{orderState[order.id] || order.status}</span>
            </button>
          ))}
        </div>
      </article>

      <OrderWorkflow selected={selected} orderState={orderState} setOrderState={setOrderState} notify={notify} />
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
            <small>{item.fix}</small>
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

function DiagnosticsPanel({ selectedDiagnostic, setSelectedDiagnostic }) {
  const active = diagnostics.find((item) => item.key === selectedDiagnostic) || diagnostics[0]

  return (
    <section className="panel diagnostic-panel">
      <div className="panel-head">
        <div>
          <p className="label">تشخیص مشکل فروشگاه</p>
          <h2>پیشنهاد سریع برای کاهش ریسک فروش</h2>
        </div>
        <span className="badge">عملیاتی</span>
      </div>
      <div className="diagnostic-grid">
        <div className="diagnostic-buttons">
          {diagnostics.map((item) => (
            <button className={item.key === active.key ? 'selected' : ''} key={item.key} onClick={() => setSelectedDiagnostic(item.key)} type="button">
              <span>{item.title}</span>
              <small>{item.impact}</small>
            </button>
          ))}
        </div>
        <article className="recommendation">
          <span>راهکار پیشنهادی</span>
          <h3>{active.title}</h3>
          <p>{active.fix}</p>
        </article>
      </div>
    </section>
  )
}

function ValueSection() {
  return (
    <section className="value-panel" aria-label="ارزش پروژه برای کارفرما">
      <div>
        <p className="label">چرا این پروژه برای کارفرما ارزش دارد؟</p>
        <h2>فروشگاه اینترنتی را از سفارش تا ارسال و گزارش کنترل کن.</h2>
      </div>
      <ul>
        <li>مدیر فروش می فهمد کدام سفارش، پرداخت یا موجودی قبل از ضرر باید پیگیری شود.</li>
        <li>تیم عملیات با یک نمای RTL فارسی، وضعیت فروشگاه و سرویس ها را بدون ابزار پراکنده می بیند.</li>
        <li>خروجی گزارش قابل ارسال به کارفرماست و نشان می دهد تصمیم ها بر اساس داده گرفته می شوند.</li>
      </ul>
    </section>
  )
}

function ProductStory({ apiStatus }) {
  return (
    <section className="story-grid" aria-label="معرفی محصول فروشگاهی">
      <article className="story-main">
        <h2>برای فروشگاهی که هر سفارش آن باید قابل پیگیری باشد</h2>
        <p>این محصول فقط یک داشبورد نیست؛ یک مسیر آماده فروش برای کنترل سفارش، پرداخت، موجودی، پیامک و گزارش مدیریتی است. نسخه فعلی با داده demo-safe کار می کند و معماری آن برای اتصال به WooCommerce، Shopify، Magento و سرویس ارسال آماده شده است.</p>
      </article>
      <article className="live-proof">
        <span>وضعیت API</span>
        <strong>{apiStatus.state}</strong>
        <p>{apiStatus.detail}</p>
      </article>
    </section>
  )
}

function ArchitectureSection() {
  return (
    <section className="architecture">
      <div>
        <h2>معماری قابل فروش</h2>
        <p>Frontend فارسی، Vercel Functions برای API، خروجی گزارش، وضعیت سفارش و مسیر اتصال به پرداخت، پیامک و انبار.</p>
      </div>
      {['React UI', 'Vercel API', 'Order State', 'Report Export', 'Integration Ready'].map((item, index) => (
        <div className="arch-node" key={item}>
          <span>{index + 1}</span>
          <strong>{item}</strong>
        </div>
      ))}
    </section>
  )
}

function ProblemSolutionSection() {
  const problems = ['سفارش های معطل', 'خطای پرداخت و پیامک', 'موجودی ناهماهنگ', 'گزارش دستی مدیر فروش']
  const solutions = ['صف سفارش قابل پیگیری', 'Retry و تشخیص خطا', 'Sync آماده اتصال', 'گزارش عملیاتی قابل خروجی']

  return (
    <section className="problem-solution" aria-label="مشکل و راه حل فروشگاه">
      <div>
        <h2>مشکل کسب و کار</h2>
        {problems.map((item) => <p key={item}>{item}</p>)}
      </div>
      <div>
        <h2>راه حل آماده فروش</h2>
        {solutions.map((item) => <p key={item}>{item}</p>)}
      </div>
    </section>
  )
}

function OfferSection() {
  return (
    <section className="offer-band" aria-label="پیشنهاد فروش محصول">
      <div>
        <h2>پکیج آماده برای کارفرما</h2>
        <p>راه اندازی داشبورد عملیات فروشگاه، اتصال اولیه API، گزارش مدیریتی، آموزش تیم و نسخه قابل توسعه برای بک اند واقعی.</p>
      </div>
      <ul>
        <li>تحویل نسخه نمایشی در ۳ روز کاری</li>
        <li>اتصال اختصاصی به فروشگاه و سرویس پیامک</li>
        <li>طراحی فارسی، واکنش گرا و آماده ارائه به مدیر فروش</li>
      </ul>
    </section>
  )
}

function PricingSection() {
  const plans = [
    ['پایه', 'تماس بگیرید', 'داشبورد دمو، برندینگ، استقرار Vercel'],
    ['حرفه ای', 'تماس بگیرید', 'اتصال API، گزارش خروجی، آموزش تیم'],
    ['سازمانی', 'تماس بگیرید', 'اتصال اختصاصی، بک اند واقعی، پشتیبانی'],
  ]
  const goToContact = () => document.querySelector('.contact-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="pricing-grid" aria-label="پکیج های فروش داشبورد">
      {plans.map(([name, price, text], index) => (
        <article className={index === 1 ? 'price-card featured' : 'price-card'} key={name}>
          <span>{name}</span>
          <strong>{price}</strong>
          <p>{text}</p>
          <button className={index === 1 ? 'primary small' : 'secondary'} type="button" onClick={goToContact}>انتخاب پلن</button>
        </article>
      ))}
    </section>
  )
}

function SuiteLinks() {
  return (
    <section className="suite-links" aria-label="دیگر محصولات Hoomko">
      <a href="https://hoomko-automation-hub.vercel.app">هاب اتوماسیون</a>
      <a href="https://hoomko-client-portal.vercel.app">پرتال مشتریان</a>
      <a href="/proposal.html">پیشنهاد فارسی</a>
      <a href="/openapi.json">OpenAPI</a>
      <a href="https://github.com/erenhooman31/hoomko-commerce-ops">GitHub</a>
    </section>
  )
}

function ContactSection({ notify }) {
  const [form, setForm] = useState({ name: '', contact: '', message: 'می خواهم نسخه مشابه داشبورد فروشگاه را برای کسب و کارم داشته باشم.' })

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submitRequest(event) {
    event.preventDefault()
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((response) => {
        if (!response.ok) throw new Error('request failed')
        notify('درخواست شما ثبت شد. در حالت دمو، این پیام بدون ذخیره واقعی تایید می شود.')
      })
      .catch(() => notify('ثبت درخواست انجام نشد. لطفا اطلاعات تماس را دوباره بررسی کنید.'))
  }

  return (
    <section className="contact-panel" aria-label="درخواست اجرای پروژه">
      <div>
        <h2>درخواست ساخت نسخه مشابه</h2>
        <p>برای فروشگاه، اتوماسیون یا پرتال مشتریان پیام بفرستید. در حالت Supabase درخواست در دیتابیس ذخیره می شود.</p>
      </div>
      <form onSubmit={submitRequest}>
        <input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="نام شما" required />
        <input value={form.contact} onChange={(event) => updateField('contact', event.target.value)} placeholder="ایمیل یا شماره تماس" required />
        <textarea value={form.message} onChange={(event) => updateField('message', event.target.value)} rows="3" required />
        <button className="primary small" type="submit">ارسال درخواست</button>
      </form>
    </section>
  )
}

function ReportsPage({ orderState, selectedDiagnostic, notify }) {
  function exportSummary() {
    const payload = {
      generatedAt: new Date().toISOString(),
      summary: 'داشبورد عملیات فروشگاه اینترنتی',
      orders: orders.map((order) => ({ ...order, workflowStage: orderState[order.id] || 'بررسی' })),
      inventory,
      diagnostic: diagnostics.find((item) => item.key === selectedDiagnostic),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'commerce-ops-summary.json'
    link.click()
    URL.revokeObjectURL(url)
    notify('گزارش عملیات فروشگاه ساخته شد.')
  }

  return (
    <>
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
      <section className="panel export-panel">
        <div>
          <p className="label">خروجی قابل ارائه</p>
          <h2>ساخت گزارش عملیات برای کارفرما</h2>
          <p>این خروجی دمو است و فقط از داده های نمونه و وضعیت ذخیره شده در مرورگر ساخته می شود.</p>
        </div>
        <button className="primary" onClick={exportSummary} type="button">دریافت گزارش JSON</button>
      </section>
    </>
  )
}

function App() {
  const [activePage, setActivePage] = usePersistentState('commerce-active-page', 'نمای کلی')
  const [channel, setChannel] = usePersistentState('commerce-channel', 'همه')
  const [selectedId, setSelectedId] = usePersistentState('commerce-selected-order', orders[0].id)
  const [orderState, setOrderState] = usePersistentState('commerce-order-state', {})
  const [selectedDiagnostic, setSelectedDiagnostic] = usePersistentState('commerce-diagnostic', diagnostics[0].key)
  const [toast, setToast] = useState('')
  const apiStatus = useApiStatus('/api/health')
  const selected = orders.find((order) => order.id === selectedId) || orders[0]

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const filteredOrders = useMemo(
    () => (channel === 'همه' ? orders : orders.filter((order) => order.channel === channel)),
    [channel],
  )

  const total = filteredOrders.reduce((sum, order) => sum + order.value, 0)
  const stagedOrders = orders.map((order) => orderState[order.id] || 'بررسی')

  return (
    <main className="app-shell" dir="rtl">
      <a className="skip-link" href="#commerce-content">رفتن به محتوای اصلی</a>
      <Toast message={toast} />
      <aside className="sidebar" aria-label="فضای کاری">
        <div className="brand">
          <span className="brand-mark">H</span>
          <div>
            <strong>مرکز فروشگاه</strong>
            <small>داشبورد عملیات فروش آنلاین</small>
          </div>
        </div>
        <nav aria-label="بخش های داشبورد فروشگاه">
          {pages.map((item) => (
            <button aria-current={activePage === item ? 'page' : undefined} className={activePage === item ? 'active' : ''} key={item} onClick={() => setActivePage(item)} type="button">
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

      <section className="workspace" id="commerce-content" tabIndex="-1">
        <header className="topbar">
          <div>
            <p className="label">نمونه کار تعاملی</p>
            <h1>داشبورد مدیریت عملیات فروشگاه اینترنتی</h1>
            <p className="hero-copy">یک محصول آماده فروش برای کنترل سفارش، پرداخت، موجودی، ارسال و گزارش در فروشگاه های آنلاین.</p>
          </div>
          <button className="primary" type="button" onClick={() => { setActivePage('نمای کلی'); setChannel('همه'); notify('نمای داشبورد بازنشانی شد.') }}>
            بازنشانی نما
          </button>
        </header>

        <MetricCards total={total} count={filteredOrders.length} stagedOrders={stagedOrders} />

        {activePage === 'نمای کلی' && (
          <>
            <ProductStory apiStatus={apiStatus} />
            <ProblemSolutionSection />
            <OrdersPage channel={channel} setChannel={setChannel} filteredOrders={filteredOrders} selected={selected} setSelected={(order) => setSelectedId(order.id)} orderState={orderState} setOrderState={setOrderState} notify={notify} />
            <DiagnosticsPanel selectedDiagnostic={selectedDiagnostic} setSelectedDiagnostic={setSelectedDiagnostic} />
            <InventoryPage />
            <ArchitectureSection />
            <OfferSection />
            <PricingSection />
            <ValueSection />
            <ContactSection notify={notify} />
            <SuiteLinks />
          </>
        )}
        {activePage === 'سفارش ها' && <OrdersPage channel={channel} setChannel={setChannel} filteredOrders={filteredOrders} selected={selected} setSelected={(order) => setSelectedId(order.id)} orderState={orderState} setOrderState={setOrderState} notify={notify} />}
        {activePage === 'موجودی' && <InventoryPage />}
        {activePage === 'اتوماسیون' && <AutomationPage />}
        {activePage === 'گزارش ها' && <ReportsPage orderState={orderState} selectedDiagnostic={selectedDiagnostic} notify={notify} />}
      </section>
    </main>
  )
}

export default App
