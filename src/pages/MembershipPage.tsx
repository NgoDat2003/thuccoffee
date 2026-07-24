import Container from '../components/ui/Container';
import FaqAccordion from '../components/ui/FaqAccordion';
import { StaticPageError, StaticPageLoading } from '../components/ui/StaticPageState';
import type { MembershipPageContent } from '../data/pages';
import { getImageUrl } from '../lib/image-url';
import { usePageMeta } from '../lib/use-page-meta';
import { useMembershipFaqs, useStaticPage } from '../services/static-pages.service';

export default function MembershipPage() {
  usePageMeta('Chính sách thành viên', 'Tích điểm và nhận ưu đãi dành riêng cho thành viên Thức Coffee.');
  const { data: page, isLoading, isError } = useStaticPage<MembershipPageContent>('membership');
  const { data: faqs = [] } = useMembershipFaqs();

  if (isLoading) return <StaticPageLoading />;
  if (isError || !page) return <StaticPageError />;
  const content = page.data;

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{content.heading}</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4 text-gray-700">
          <p>{content.intro}</p>
          <p className="rounded border-l-4 border-primary bg-gray-50 p-4 font-medium">
            {content.pointRule}
          </p>
          <img src={getImageUrl('site/751cd7ba_2.png')} alt="Ưu đãi thành viên Thức Coffee" className="w-full rounded" />
        </div>
        <div>
          <img src={getImageUrl('site/a030442e_4.png')} alt="Mã QR Thức Coffee" className="w-full rounded" />
          <p className="mt-3 text-center text-sm text-gray-600">{content.qrCaption}</p>
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
              {content.tiers.map((tier) => (
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
          {content.tierNotes.map((note) => <p key={note}>{note}</p>)}
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-primary">Câu hỏi thường gặp</h2>
          <FaqAccordion items={faqs.map((faq) => ({ q: faq.question, a: faq.answer }))} />
        </section>
      )}
      <section className="mt-10 rounded bg-gray-50 p-5">
        <h2 className="mb-2 text-lg font-semibold text-primary">HỖ TRỢ</h2>
        <p className="text-gray-700">{content.support}</p>
      </section>
    </Container>
  );
}
