import memberBenefitsImage from '../assets/images/site/751cd7ba_2.png';
import memberQrImage from '../assets/images/site/a030442e_4.png';
import Container from '../components/ui/Container';
import FaqAccordion from '../components/ui/FaqAccordion';
import { pages } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function MembershipPage() {
  usePageMeta('Chính sách thành viên', 'Tích điểm và nhận ưu đãi dành riêng cho thành viên Thức Coffee.');

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{pages.membership.heading}</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4 text-gray-700">
          <p>{pages.membership.intro}</p>
          <p className="rounded border-l-4 border-primary bg-gray-50 p-4 font-medium">
            {pages.membership.pointRule}
          </p>
          <img src={memberBenefitsImage} alt="Ưu đãi thành viên Thức Coffee" className="w-full rounded" />
        </div>
        <div>
          <img src={memberQrImage} alt="Mã QR Thức Coffee" className="w-full rounded" />
          <p className="mt-3 text-center text-sm text-gray-600">{pages.membership.qrCaption}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-primary">Chính sách hạng thành viên</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="border border-primary px-4 py-3">Chi tiêu tích luỹ</th>
                <th className="border border-primary px-4 py-3">Hạng thành viên</th>
                <th className="border border-primary px-4 py-3">Ưu đãi</th>
                <th className="border border-primary px-4 py-3">Điều kiện duy trì</th>
              </tr>
            </thead>
            <tbody>
              {pages.membership.tiers.map((tier) => (
                <tr key={tier.name} className="align-top even:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3">{tier.spending}</td>
                  <td className="border border-gray-200 px-4 py-3 font-semibold">{tier.name}</td>
                  <td className="border border-gray-200 px-4 py-3">{tier.benefit}</td>
                  <td className="border border-gray-200 px-4 py-3">{tier.maintenance ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {pages.membership.tierNotes.map((note) => <p key={note}>{note}</p>)}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-primary">Câu hỏi thường gặp</h2>
        <FaqAccordion items={pages.membershipFaq} />
      </section>
      <section className="mt-10 rounded bg-gray-50 p-5">
        <h2 className="mb-2 text-lg font-semibold text-primary">HỖ TRỢ</h2>
        <p className="text-gray-700">{pages.membership.support}</p>
      </section>
    </Container>
  );
}
