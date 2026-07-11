import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư · KFC Ordering Agent",
  description: "Chính sách quyền riêng tư của trợ lý đặt hàng KFC qua Facebook Messenger — dữ liệu thu thập, mục đích sử dụng, lưu trữ và quyền của người dùng.",
  robots: { index: true, follow: true }, // Facebook crawler + công cụ tìm kiếm phải đọc được
};

// Trang PUBLIC — không auth, không geo-block (yêu cầu của Meta App Review).
// Ngày hiệu lực cố định để hiển thị ổn định (dự án hackathon AABW 2026).
const EFFECTIVE_DATE = "11/07/2026";

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-50 px-5 py-10 text-zinc-800 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <BrandMark />
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-red-600">Trang chủ</Link>
        </header>

        <article className="prose-kfc rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-9">
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">Chính sách quyền riêng tư</h1>
          <p className="mt-2 text-sm text-zinc-500">Ngày hiệu lực: {EFFECTIVE_DATE}</p>

          <p className="mt-6 text-sm leading-7">
            Trợ lý đặt hàng KFC (&ldquo;Ứng dụng&rdquo;, &ldquo;chúng tôi&rdquo;) là trợ lý hội thoại giúp khách hàng đặt món KFC qua
            Facebook Messenger. Đây là sản phẩm được xây dựng cho cuộc thi Agentic AI Build Week 2026. Chính sách này giải thích
            chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn như thế nào khi bạn nhắn tin với Ứng dụng.
          </p>

          <Section title="1. Thông tin chúng tôi thu thập">
            Khi bạn đặt hàng qua Messenger, chúng tôi thu thập:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Mã người dùng Messenger (PSID):</strong> định danh do Facebook cấp để gửi/nhận tin nhắn với bạn.</li>
              <li><strong>Nội dung tin nhắn:</strong> các tin bạn gửi để đặt món, hỏi menu, áp ưu đãi.</li>
              <li><strong>Thông tin giao hàng:</strong> địa chỉ và số điện thoại bạn cung cấp để giao đơn.</li>
              <li><strong>Thông tin đơn hàng:</strong> món đã chọn, tổng tiền, phương thức thanh toán, điểm thành viên.</li>
            </ul>
            Chúng tôi <strong>không</strong> thu thập mật khẩu Facebook, thông tin thẻ thanh toán thật, hay dữ liệu ngoài phạm vi đặt hàng.
          </Section>

          <Section title="2. Mục đích sử dụng">
            Thông tin của bạn chỉ dùng để:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Xử lý và giao đơn hàng bạn đặt.</li>
              <li>Gợi ý món phù hợp và áp ưu đãi đang có.</li>
              <li>Gửi cập nhật trạng thái đơn (đã nhận, đang chuẩn bị, đang giao, đã giao).</li>
              <li>Chuyển tới nhân viên hỗ trợ khi bạn cần.</li>
            </ul>
            Chúng tôi <strong>không bán, không chia sẻ</strong> thông tin của bạn cho bên thứ ba vì mục đích quảng cáo.
          </Section>

          <Section title="3. Lưu trữ & bảo mật">
            Dữ liệu được lưu trên cơ sở dữ liệu bảo mật (Neon PostgreSQL) với kết nối mã hóa. Số điện thoại được che một phần
            khi hiển thị cho nhân viên. Chúng tôi áp dụng các biện pháp kỹ thuật hợp lý để bảo vệ dữ liệu khỏi truy cập trái phép.
          </Section>

          <Section title="4. Chia sẻ với bên thứ ba">
            Ứng dụng sử dụng một số dịch vụ để vận hành: Meta (Facebook Messenger) để gửi/nhận tin nhắn, nhà cung cấp mô hình
            ngôn ngữ (OpenAI) để hiểu và trả lời tin nhắn, và hạ tầng lưu trữ đám mây. Các bên này chỉ xử lý dữ liệu ở mức cần
            thiết để cung cấp dịch vụ và theo chính sách riêng tư của họ.
          </Section>

          <Section title="5. Quyền của bạn">
            Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu của mình. Để thực hiện, nhắn &ldquo;xóa dữ liệu của tôi&rdquo;
            trong cuộc trò chuyện Messenger hoặc liên hệ qua email bên dưới. Chúng tôi sẽ xử lý trong thời gian hợp lý.
          </Section>

          <Section title="6. Lưu giữ dữ liệu">
            Dữ liệu đơn hàng và hội thoại được lưu trong thời gian cần thiết để phục vụ đặt hàng và hỗ trợ. Đây là sản phẩm
            trình diễn hackathon; dữ liệu demo có thể được xóa định kỳ.
          </Section>

          <Section title="7. Thay đổi chính sách">
            Chúng tôi có thể cập nhật chính sách này. Phiên bản mới nhất luôn hiển thị tại trang này kèm ngày hiệu lực.
          </Section>

          <Section title="8. Liên hệ">
            Mọi câu hỏi về quyền riêng tư, vui lòng liên hệ: <a className="font-semibold text-red-700 underline" href="mailto:baole@goku.agency">baole@goku.agency</a>.
          </Section>

          <p className="mt-8 border-t border-zinc-200 pt-6 text-xs leading-6 text-zinc-400">
            Đây là sản phẩm dự thi Agentic AI Build Week 2026, không phải ứng dụng chính thức của KFC Việt Nam. Thương hiệu &ldquo;KFC&rdquo;
            thuộc về chủ sở hữu tương ứng; sử dụng trong phạm vi trình diễn của cuộc thi.
          </p>
        </article>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="text-lg font-black text-zinc-950">{title}</h2>
      <div className="mt-2 text-sm leading-7 text-zinc-700">{children}</div>
    </section>
  );
}
