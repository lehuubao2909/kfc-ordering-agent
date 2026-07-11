const slides = [
  {
    label: "Cover",
    badge: "Slide 01",
    title: "KFC Ordering Agent",
    subtitle: "Đặt món tiếng Việt qua Messenger, với LLM làm hội thoại và service layer giữ tiền, trạng thái và độ tin cậy.",
    body: `
      <div class="slide-grid cover-grid">
        <section class="span-7">
          <p class="eyebrow">Team GOKU</p>
          <h3 class="hero-title">Từ một tin nhắn đến một đơn hàng hoàn chỉnh.</h3>
          <p class="hero-copy">
            Trải nghiệm đặt món được thiết kế như một pitch deck product-first:
            gọn, rõ, có thể demo trực tiếp trên browser và vẫn đủ đường đi sang production.
          </p>
          <div class="chip-row">
            <span class="mini-chip">5 thành viên</span>
            <span class="mini-chip">F&B agent</span>
            <span class="mini-chip">Demo-ready core</span>
          </div>
          <div class="name-strip">
            <span>Sơn Phước Lộc</span>
            <span>Lê Hữu Bảo</span>
            <span>Nguyễn Trọng Hùng</span>
            <span>Nguyễn Anh Tuấn</span>
            <span>Nguyễn Đức Thịnh</span>
          </div>
        </section>

        <aside class="span-5">
          <div class="visual-stack">
            <div class="stage-card stage-card-top">
              <span>Messenger</span>
              <strong>Người dùng nhắn món</strong>
            </div>
            <div class="stage-arrow">↓</div>
            <div class="stage-card">
              <span>Service layer</span>
              <strong>LLM + state machine + validation</strong>
            </div>
            <div class="stage-arrow">↓</div>
            <div class="stage-card stage-card-bottom">
              <span>Order result</span>
              <strong>Xác nhận, thanh toán, tracking</strong>
            </div>
          </div>
        </aside>
      </div>
    `,
  },
  {
    label: "Problem",
    badge: "Slide 02",
    title: "Vấn đề",
    subtitle: "Đặt món qua chat nghe đơn giản, nhưng nếu không có state rõ ràng thì rất dễ nhầm món, nhầm tiền và nhầm trạng thái.",
    body: `
      <div class="slide-grid">
        <section class="span-7">
          <div class="card">
            <p class="card-kicker">Pain points</p>
            <ul class="bullet-list compact">
              <li>Chat tự nhiên nhưng dễ mất ngữ cảnh khi thêm món, sửa món hoặc đổi địa chỉ.</li>
              <li>Nhân viên phải nhìn nhiều màn hình để theo dõi đơn, không có một luồng duy nhất.</li>
              <li>Thanh toán và cập nhật trạng thái cần minh bạch, không thể để LLM tự quyết.</li>
            </ul>
          </div>
        </section>
        <section class="span-5">
          <div class="card card-accent">
            <p class="card-kicker">What breaks</p>
            <div class="before-after">
              <div>
                <span>Trước</span>
                <strong>Chat rời rạc</strong>
                <small>nhiều bước, nhiều sai số</small>
              </div>
              <div class="before-after-arrow">→</div>
              <div>
                <span>Sau</span>
                <strong>Luồng có state</strong>
                <small>một nguồn sự thật duy nhất</small>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  },
  {
    label: "Solution",
    badge: "Slide 03",
    title: "Giải pháp",
    subtitle: "LLM chỉ lo hội thoại, còn mọi thứ liên quan đến tiền, luật nghiệp vụ và trạng thái đơn đều đi qua service layer.",
    body: `
      <div class="slide-grid solution-grid">
        <section class="span-4 card">
          <p class="card-kicker">1. LLM</p>
          <h4>Hiểu ý người dùng</h4>
          <p>Nhận câu tự nhiên, giữ ngữ cảnh, trả lời ngắn và đúng giọng.</p>
        </section>
        <section class="span-4 card">
          <p class="card-kicker">2. Service</p>
          <h4>Giữ luật nghiệp vụ</h4>
          <p>Tính tiền, kiểm tra menu, voucher, payment và state machine.</p>
        </section>
        <section class="span-4 card">
          <p class="card-kicker">3. Event</p>
          <h4>Push kết quả</h4>
          <p>Đẩy cập nhật sang Messenger và dashboard vận hành.</p>
        </section>
        <section class="span-12 card card-accent">
          <p class="callout">Điểm khác biệt: không tin một lớp duy nhất. UI, agent và route chỉ là lớp ngoài; service layer mới là nguồn sự thật.</p>
        </section>
      </div>
    `,
  },
  {
    label: "Users",
    badge: "Slide 04",
    title: "Người dùng",
    subtitle: "Sản phẩm phục vụ hai nhóm chính: khách đặt món và đội vận hành. Mỗi nhóm có một nhu cầu rất khác nhau.",
    body: `
      <div class="slide-grid">
        <section class="span-6 card persona-card">
          <p class="card-kicker">Khách hàng</p>
          <h4>Muốn đặt nhanh, không phải học app mới</h4>
          <ul class="bullet-list compact">
            <li>Nhắn món bằng tiếng Việt tự nhiên.</li>
            <li>Xác nhận, thanh toán và theo dõi đơn ngay trong luồng chat.</li>
            <li>Nhận gợi ý món thêm đúng ngữ cảnh.</li>
          </ul>
        </section>
        <section class="span-6 card persona-card">
          <p class="card-kicker">Staff</p>
          <h4>Muốn nhìn một màn hình là đủ</h4>
          <ul class="bullet-list compact">
            <li>Xem transcript, trạng thái đơn và takeover.</li>
            <li>Đổi trạng thái nhanh khi có sự cố hoặc chậm đơn.</li>
            <li>Giữ trải nghiệm nhất quán giữa bot và nhân viên.</li>
          </ul>
        </section>
      </div>
    `,
  },
  {
    label: "Overview",
    badge: "Slide 05",
    title: "Tổng quan sản phẩm",
    subtitle: "Repo chia thành các module rõ vai trò: frontend trình diễn, service layer xử lý, và layer tích hợp để đẩy kết quả ra ngoài.",
    body: `
      <div class="slide-grid overview-grid">
        <section class="span-8 card">
          <p class="card-kicker">Module map</p>
          <div class="module-map">
            <span>Landing</span>
            <span>Admin</span>
            <span>Staff</span>
            <span>Tracking</span>
            <span>Payment</span>
            <span>Messenger</span>
          </div>
        </section>
        <aside class="span-4 card">
          <p class="card-kicker">Core layers</p>
          <ul class="bullet-list compact">
            <li>Frontend: trình bày và điều hướng.</li>
            <li>API: wrapper mỏng, validate và auth.</li>
            <li>Service: business logic và state.</li>
          </ul>
        </aside>
      </div>
    `,
  },
  {
    label: "Features",
    badge: "Slide 06",
    title: "Tính năng lõi",
    subtitle: "Chỉ giữ những gì đã có bằng chứng trong source, và ghi rõ trạng thái để tránh overclaim.",
    body: `
      <div class="slide-grid features-grid">
        <article class="span-6 card status-card">
          <p class="status ready">READY</p>
          <h4>Menu, order, metrics</h4>
          <ul class="bullet-list compact">
            <li>Menu API có search và fallback fixtures.</li>
            <li>Order state machine có guard chuyển trạng thái.</li>
          </ul>
        </article>
        <article class="span-6 card status-card">
          <p class="status partial">PARTIAL</p>
          <h4>Webhook & event push</h4>
          <ul class="bullet-list compact">
            <li>Messenger webhook đã echo được.</li>
            <li>Notification path đã tách riêng, chờ agent loop thật.</li>
          </ul>
        </article>
        <article class="span-6 card status-card">
          <p class="status mock">MOCK</p>
          <h4>UI demo layer</h4>
          <ul class="bullet-list compact">
            <li>Admin và staff đang dùng mock data để ổn định demo.</li>
            <li>Payment là luồng mock rõ ràng, không giả cổng thật.</li>
          </ul>
        </article>
        <article class="span-6 card status-card">
          <p class="status planned">PLANNED</p>
          <h4>Agent tools & production bridge</h4>
          <ul class="bullet-list compact">
            <li>Tool calling, queue, dedupe và handoff còn trong TODO.</li>
            <li>Payment production nằm ở roadmap riêng.</li>
          </ul>
        </article>
      </div>
    `,
  },
  {
    label: "Flow",
    badge: "Slide 07",
    title: "Luồng người dùng",
    subtitle: "Một luồng đơn giản: chat vào, service xử lý, đơn được chốt, và Messenger hoặc dashboard đẩy kết quả ngược lại.",
    body: `
      <div class="flow-track flow-lane">
        <div class="flow-step"><span>1</span><strong>Mở chat</strong><small>Messenger / landing</small></div>
        <div class="flow-step"><span>2</span><strong>Chọn món</strong><small>LLM hiểu ngữ cảnh</small></div>
        <div class="flow-step"><span>3</span><strong>Xác nhận</strong><small>cart + voucher + địa chỉ</small></div>
        <div class="flow-step"><span>4</span><strong>Thanh toán</strong><small>COD / QR mock</small></div>
        <div class="flow-step"><span>5</span><strong>Theo dõi</strong><small>push trạng thái</small></div>
      </div>
    `,
  },
  {
    label: "Architecture",
    badge: "Slide 08",
    title: "Kiến trúc hệ thống",
    subtitle: "Kiến trúc chia tầng để tránh mix giữa chat, tiền và trạng thái. Mỗi lớp có một trách nhiệm rõ ràng.",
    body: `
      <div class="slide-grid architecture-grid">
        <section class="span-8">
          <div class="arch-stack">
            <div class="arch-layer"><strong>Client</strong><span>Messenger, landing, staff, admin, tracking</span></div>
            <div class="arch-layer"><strong>Frontend</strong><span>Next.js App Router + React components</span></div>
            <div class="arch-layer"><strong>API wrapper</strong><span>parse, auth, validate, envelope</span></div>
            <div class="arch-layer"><strong>Service layer</strong><span>menu, cart, order, voucher, loyalty, metrics</span></div>
            <div class="arch-layer"><strong>Data & external</strong><span>Neon, fixtures, Messenger, OpenAI, payment roadmap</span></div>
          </div>
        </section>
        <aside class="span-4 card">
          <p class="card-kicker">Why this works</p>
          <ul class="bullet-list compact">
            <li>State machine nằm trong backend.</li>
            <li>LLM không tự quyết giá hoặc trạng thái.</li>
            <li>Fallback dữ liệu giúp demo không gãy.</li>
          </ul>
        </aside>
      </div>
    `,
  },
  {
    label: "Stack",
    badge: "Slide 09",
    title: "Technology stack",
    subtitle: "Chỉ giữ công nghệ quan trọng nhất cho sản phẩm và buổi pitch, không liệt kê dependency vặt.",
    body: `
      <div class="slide-grid stack-grid">
        <article class="span-3 card tech-card"><h4>Frontend</h4><p>Next.js 16</p><p>React 19</p><p>Motion</p><p>Tailwind v4</p></article>
        <article class="span-3 card tech-card"><h4>Backend</h4><p>TypeScript</p><p>Drizzle ORM</p><p>Neon Postgres</p><p>Zod</p></article>
        <article class="span-3 card tech-card"><h4>Integration</h4><p>Messenger API</p><p>OpenAI SDK</p><p>QR generation</p><p>Mock payment</p></article>
        <article class="span-3 card tech-card"><h4>Tooling</h4><p>ESLint</p><p>tsx scripts</p><p>Seed + backtest</p><p>Vercel deploy</p></article>
      </div>
    `,
  },
  {
    label: "Highlights",
    badge: "Slide 10",
    title: "Điểm nổi bật",
    subtitle: "Mục tiêu của deck này là làm rõ những điểm kỹ thuật có sức nặng trong demo, không phải khoe chi tiết thừa.",
    body: `
      <div class="slide-grid highlights-grid">
        <section class="span-7 card">
          <ul class="feature-list compact">
            <li>State machine có luật rõ, không nhảy state tùy ý.</li>
            <li>Service layer validates lại mọi dữ liệu trước khi chốt.</li>
            <li>Menu có cache và fallback fixture để demo ổn định.</li>
            <li>Order status đi qua event hub rồi mới push ra kênh.</li>
            <li>Dữ liệu nhạy cảm được mask ở view admin.</li>
          </ul>
        </section>
        <aside class="span-5 card accent-panel">
          <p class="card-kicker">Message</p>
          <h4>Deterministic ở chỗ đụng tiền, linh hoạt ở chỗ đụng ngôn ngữ.</h4>
        </aside>
      </div>
    `,
  },
  {
    label: "Demo",
    badge: "Slide 11",
    title: "Kịch bản demo",
    subtitle: "Demo nên ngắn, rõ và lặp lại được. Slide này là kịch bản để đứng sân khấu không bị vấp.",
    body: `
      <div class="slide-grid demo-grid">
        <section class="span-7 card">
          <ol class="timeline-list compact">
            <li><span>1</span> Mở landing page và quét QR.</li>
            <li><span>2</span> Nhắn món trong Messenger.</li>
            <li><span>3</span> Xác nhận giỏ hàng, địa chỉ và thanh toán mock.</li>
            <li><span>4</span> Mở /order để xem trạng thái.</li>
            <li><span>5</span> Staff console đổi trạng thái nếu cần.</li>
          </ol>
        </section>
        <aside class="span-5 card demo-screen">
          <p class="card-kicker">Audience sees</p>
          <div class="screen-stack">
            <div class="screen-mini">Landing</div>
            <div class="screen-mini">Messenger</div>
            <div class="screen-mini">Order tracking</div>
          </div>
        </aside>
      </div>
    `,
  },
  {
    label: "Progress",
    badge: "Slide 12",
    title: "Current progress",
    subtitle: "Đây là ước lượng kỹ thuật dựa trên source hiện tại, không phải tỷ lệ cảm tính.",
    body: `
      <div class="card table-card">
        <table class="status-table compact-table">
          <thead>
            <tr>
              <th>Hạng mục</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Service layer</td><td><span class="status ready">READY</span></td><td>Đã có state machine, menu, order, metrics.</td></tr>
            <tr><td>API routes</td><td><span class="status ready">READY</span></td><td>Menu, order detail, admin và payment confirm.</td></tr>
            <tr><td>Frontend demo</td><td><span class="status partial">PARTIAL</span></td><td>UI đẹp, một số màn vẫn dùng mock data.</td></tr>
            <tr><td>Messenger loop</td><td><span class="status partial">PARTIAL</span></td><td>Webhook echo có, agent loop thật còn TODO.</td></tr>
            <tr><td>Payment production</td><td><span class="status planned">PLANNED</span></td><td>Webhook thật và reconciliation nằm ở roadmap.</td></tr>
          </tbody>
        </table>
      </div>
    `,
  },
  {
    label: "Challenges",
    badge: "Slide 13",
    title: "Thách thức",
    subtitle: "Khó nhất không phải UI mà là độ tin cậy: webhook, payment, concurrency và tính nhất quán của state.",
    body: `
      <div class="slide-grid">
        <section class="span-6 card">
          <p class="card-kicker">Challenges</p>
          <ul class="bullet-list compact">
            <li>Webhook thật cần verify, dedupe và chống replay.</li>
            <li>Payment thật cần signature, idempotency và reconcile.</li>
            <li>Đồng thời nhiều request có thể gây double transition.</li>
          </ul>
        </section>
        <aside class="span-6 card">
          <p class="card-kicker">Current answer</p>
          <ul class="bullet-list compact">
            <li>Giữ service layer là nguồn sự thật.</li>
            <li>Fallback sang fixtures để demo không gãy.</li>
            <li>Tách rõ mock, planned và production path.</li>
          </ul>
        </aside>
      </div>
    `,
  },
  {
    label: "Roadmap",
    badge: "Slide 14",
    title: "Roadmap",
    subtitle: "Đường đi tiếp theo được chia thành bốn pha rõ ràng: hoàn thiện, ổn định, production và mở rộng.",
    body: `
      <div class="roadmap-grid">
        <article class="card roadmap-card"><span>01</span><strong>Ngay sau cuộc thi</strong><p>Hoàn thiện agent loop và webhook Messenger.</p></article>
        <article class="card roadmap-card"><span>02</span><strong>MVP</strong><p>Chuyển các màn vận hành từ mock sang live data.</p></article>
        <article class="card roadmap-card"><span>03</span><strong>Production</strong><p>Webhook payment thật, reconcile và observability.</p></article>
        <article class="card roadmap-card"><span>04</span><strong>Mở rộng</strong><p>Store-aware routing, loyalty và thêm kênh chat.</p></article>
      </div>
    `,
  },
  {
    label: "Impact",
    badge: "Slide 15",
    title: "Giá trị",
    subtitle: "Giá trị thật của sản phẩm nằm ở trải nghiệm nhanh hơn, vận hành rõ hơn và khả năng mở rộng tốt hơn.",
    body: `
      <div class="slide-grid">
        <section class="span-6 card">
          <p class="card-kicker">For customers</p>
          <ul class="bullet-list compact">
            <li>Đặt món tự nhiên như nhắn tin.</li>
            <li>Nhận xác nhận và tracking rõ ràng.</li>
            <li>Được gợi ý món thêm đúng ngữ cảnh.</li>
          </ul>
        </section>
        <aside class="span-6 card">
          <p class="card-kicker">For ops</p>
          <ul class="bullet-list compact">
            <li>Giảm đổi ngữ cảnh giữa chat, admin và tracking.</li>
            <li>Chuẩn hóa state, voucher và payment.</li>
            <li>Tạo nền cho loyalty, analytics và mở rộng chi nhánh.</li>
          </ul>
        </aside>
        <div class="span-12 chip-row benefits-row">
          <span class="mini-chip">Nhanh hơn</span>
          <span class="mini-chip">Rõ hơn</span>
          <span class="mini-chip">Dễ mở rộng hơn</span>
        </div>
      </div>
    `,
  },
  {
    label: "Closing",
    badge: "Slide 16",
    title: "GOKU",
    subtitle: "LLM lo hội thoại, service layer lo sự thật, còn deck này chứng minh sản phẩm đã đủ chín để pitch.",
    body: `
      <div class="closing-layout">
        <section class="card closing-hero">
          <p class="card-kicker">Thank you</p>
          <h3>Chúng tôi không chỉ làm chatbot. Chúng tôi làm một hệ thống đặt hàng có thể vận hành.</h3>
          <ul class="bullet-list compact">
            <li>Hội thoại tự nhiên.</li>
            <li>Tiền và state có luật.</li>
            <li>Demo rõ, roadmap thật.</li>
          </ul>
        </section>
        <section class="card">
          <p class="card-kicker">Team GOKU</p>
          <div class="team-grid">
            <span>Sơn Phước Lộc</span>
            <span>Lê Hữu Bảo</span>
            <span>Nguyễn Trọng Hùng</span>
            <span>Nguyễn Anh Tuấn</span>
            <span>Nguyễn Đức Thịnh</span>
          </div>
        </section>
      </div>
    `,
  },
];

const deckTrack = document.getElementById("deckTrack");
const progressBar = document.getElementById("progressBar");
const slideCounter = document.getElementById("slideCounter");
const slideLabel = document.getElementById("slideLabel");
const exportStatus = document.getElementById("exportStatus");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const printBtn = document.getElementById("printBtn");
const deckShell = document.getElementById("deckShell");
const toolbar = document.querySelector(".toolbar");
const progressShell = document.querySelector(".progress-shell");

let currentIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let isExporting = false;
let exportOverlay = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function getExportLibs() {
  const htmlToImage = window.htmlToImage;
  const jsPDF = window.jspdf?.jsPDF;

  if (!htmlToImage?.toPng) {
    throw new Error("Không tải được html-to-image từ CDN.");
  }

  if (!jsPDF) {
    throw new Error("Không tải được jsPDF từ CDN.");
  }

  return { htmlToImage, jsPDF };
}

function shouldUseHighQualityExport() {
  const cores = navigator.hardwareConcurrency ?? 0;
  const memory = navigator.deviceMemory ?? 0;
  return window.devicePixelRatio >= 2 || cores >= 8 || memory >= 8;
}

function setExportStatus(message) {
  if (exportStatus) {
    exportStatus.textContent = message;
    exportStatus.hidden = !message;
  }

  if (exportOverlay) {
    exportOverlay.textContent = message;
  }
}

function createExportOverlay() {
  const overlay = document.createElement("div");
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "polite");
  overlay.style.position = "fixed";
  overlay.style.top = "16px";
  overlay.style.left = "50%";
  overlay.style.transform = "translateX(-50%)";
  overlay.style.zIndex = "1000";
  overlay.style.padding = "10px 14px";
  overlay.style.borderRadius = "999px";
  overlay.style.background = "rgba(8, 10, 14, 0.88)";
  overlay.style.border = "1px solid rgba(255, 255, 255, 0.1)";
  overlay.style.backdropFilter = "blur(12px)";
  overlay.style.color = "#f5f7fb";
  overlay.style.font = "700 0.88rem/1.2 Inter, Segoe UI, system-ui, sans-serif";
  overlay.style.letterSpacing = "-0.01em";
  overlay.style.pointerEvents = "none";
  overlay.textContent = "";
  return overlay;
}

function lockExportUi(lock) {
  isExporting = lock;
  prevBtn.disabled = lock;
  nextBtn.disabled = lock;
  printBtn.disabled = lock;

  if (toolbar) {
    toolbar.hidden = lock;
  }

  if (progressShell) {
    progressShell.hidden = lock;
  }

  if (lock) {
    if (!exportOverlay) {
      exportOverlay = createExportOverlay();
      document.body.appendChild(exportOverlay);
    }
  } else if (exportOverlay) {
    exportOverlay.remove();
    exportOverlay = null;
  }
}

async function exportPdf() {
  const { htmlToImage, jsPDF } = getExportLibs();
  const slideNodes = Array.from(document.querySelectorAll(".slide"));

  if (!slideNodes.length) {
    throw new Error("Không tìm thấy slide nào để export.");
  }

  const pdfWidth = 1920;
  const pdfHeight = 1080;
  const pixelRatio = shouldUseHighQualityExport() ? 2 : 1;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [pdfWidth, pdfHeight],
    compress: true,
  });
  const exportStage = document.createElement("div");
  const disableMotionStyle = document.createElement("style");

  exportStage.setAttribute("aria-hidden", "true");
  exportStage.style.position = "fixed";
  exportStage.style.left = "-100000px";
  exportStage.style.top = "0";
  exportStage.style.width = `${pdfWidth}px`;
  exportStage.style.height = `${pdfHeight}px`;
  exportStage.style.overflow = "hidden";
  exportStage.style.pointerEvents = "none";
  exportStage.style.zIndex = "-1";

  disableMotionStyle.dataset.exportMode = "true";
  disableMotionStyle.textContent = `
    *, *::before, *::after {
      animation: none !important;
      animation-delay: 0s !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  `;

  document.body.appendChild(exportStage);
  document.head.appendChild(disableMotionStyle);

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    for (let index = 0; index < slideNodes.length; index += 1) {
      const sourceSlide = slideNodes[index];
      const slideClone = sourceSlide.cloneNode(true);

      slideClone.classList.remove("is-inactive");
      slideClone.classList.add("is-active");
      slideClone.setAttribute("aria-hidden", "false");
      slideClone.style.width = `${pdfWidth}px`;
      slideClone.style.height = `${pdfHeight}px`;
      slideClone.style.margin = "0";
      slideClone.style.position = "relative";
      slideClone.style.transform = "none";
      slideClone.style.filter = "none";
      slideClone.style.opacity = "1";
      slideClone.style.visibility = "visible";
      slideClone.style.overflow = "hidden";
      slideClone.style.boxSizing = "border-box";

      exportStage.replaceChildren(slideClone);
      setExportStatus(`Đang xuất slide ${index + 1}/${slideNodes.length}`);
      await nextFrame();

      const dataUrl = await htmlToImage.toPng(slideClone, {
        cacheBust: true,
        backgroundColor: "#07090e",
        pixelRatio,
        width: pdfWidth,
        height: pdfHeight,
        style: {
          width: `${pdfWidth}px`,
          height: `${pdfHeight}px`,
          margin: "0",
          transform: "none",
          transformOrigin: "top left",
        },
      });

      if (index > 0) {
        pdf.addPage();
      }

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
    }

    setExportStatus("Đang hoàn tất PDF...");
    pdf.save("KFC-Ordering-Agent-GOKU.pdf");
  } finally {
    disableMotionStyle.remove();
    exportStage.remove();
    lockExportUi(false);
    setExportStatus("");
    deckTrack.style.setProperty("--offset", String(currentIndex));
  }
}

function renderSlide(slide, index) {
  return `
    <article class="slide" data-index="${index}" aria-hidden="true" aria-label="${escapeHtml(slide.label)}">
      <header class="slide-header">
        <div>
          <p class="eyebrow">${escapeHtml(slide.badge)}</p>
          <h2 class="slide-title">${escapeHtml(slide.title)}</h2>
          <p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>
        </div>
        <div class="slide-badge">${escapeHtml(slide.badge)}</div>
      </header>
      <div class="slide-body">${slide.body}</div>
    </article>
  `;
}

function renderDeck() {
  deckTrack.innerHTML = slides.map(renderSlide).join("");
  deckTrack.style.setProperty("--offset", String(currentIndex));
  slides.forEach((_, index) => {
    const node = deckTrack.children[index];
    if (!node) return;
    node.classList.toggle("is-active", index === currentIndex);
    node.classList.toggle("is-inactive", index !== currentIndex);
    node.setAttribute("aria-hidden", index === currentIndex ? "false" : "true");
  });
}

function updateHud() {
  const current = currentIndex + 1;
  slideCounter.textContent = `Slide ${current} / ${slides.length}`;
  slideLabel.textContent = slides[currentIndex]?.label ?? "";
  progressBar.style.width = `${(current / slides.length) * 100}%`;
}

function syncHash(index) {
  const hash = `#slide-${index + 1}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
}

function setSlide(index, { sync = true } = {}) {
  currentIndex = Math.max(0, Math.min(slides.length - 1, index));
  deckTrack.style.setProperty("--offset", String(currentIndex));
  renderDeck();
  updateHud();
  if (sync) syncHash(currentIndex);
}

function indexFromHash() {
  const match = location.hash.match(/^#slide-(\d+)$/i);
  return match ? Math.max(0, Number(match[1]) - 1) : 0;
}

function nextSlide() {
  setSlide(currentIndex + 1);
}

function previousSlide() {
  setSlide(currentIndex - 1);
}

function onKeyDown(event) {
  if (isExporting) return;

  const tag = event.target?.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || event.metaKey || event.ctrlKey || event.altKey) return;

  switch (event.key) {
    case "ArrowRight":
    case "PageDown":
    case " ":
      event.preventDefault();
      nextSlide();
      break;
    case "ArrowLeft":
    case "PageUp":
      event.preventDefault();
      previousSlide();
      break;
    case "Home":
      event.preventDefault();
      setSlide(0);
      break;
    case "End":
      event.preventDefault();
      setSlide(slides.length - 1);
      break;
    default:
      break;
  }
}

function onTouchStart(event) {
  if (isExporting) return;

  touchStartX = event.changedTouches[0]?.screenX ?? 0;
}

function onTouchEnd(event) {
  if (isExporting) return;

  touchEndX = event.changedTouches[0]?.screenX ?? 0;
  const delta = touchEndX - touchStartX;
  if (Math.abs(delta) < 50) return;
  if (delta < 0) nextSlide();
  else previousSlide();
}

function bindEvents() {
  prevBtn.addEventListener("click", previousSlide);
  nextBtn.addEventListener("click", nextSlide);
  printBtn.addEventListener("click", () => {
    if (isExporting) return;
    lockExportUi(true);
    setExportStatus(`Đang xuất slide ${currentIndex + 1}/${slides.length}`);
    void exportPdf().catch((error) => {
      console.error("Export PDF failed:", error);
      setExportStatus("Xuất PDF thất bại");
    });
  });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("hashchange", () => setSlide(indexFromHash(), { sync: false }));
  deckShell.addEventListener("touchstart", onTouchStart, { passive: true });
  deckShell.addEventListener("touchend", onTouchEnd, { passive: true });
}

function init() {
  renderDeck();
  bindEvents();
  setSlide(indexFromHash(), { sync: false });
  document.title = `${slides[currentIndex].title} · KFC Ordering Agent`;
}

init();
