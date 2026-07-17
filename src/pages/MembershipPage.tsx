import Container from '../components/ui/Container';
import FaqAccordion from '../components/ui/FaqAccordion';
import { pages } from '../data';

export default function MembershipPage() {
  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">Chính sách thành viên</h1>
      <p className="max-w-2xl text-gray-700">
        Tích điểm mỗi lần ghé Thức và đổi lấy những ưu đãi hấp dẫn dành riêng cho thành viên.
      </p>
      <div className="mt-8 max-w-2xl">
        <FaqAccordion items={pages.membershipFaq} />
      </div>
    </Container>
  );
}
