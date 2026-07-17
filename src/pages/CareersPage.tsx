import Container from '../components/ui/Container';
import { pages } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function CareersPage() {
  usePageMeta('Tuyển dụng', 'Cơ hội việc làm tại Thức Coffee.');

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">Tuyển dụng</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {pages.jobs.map((job) => (
          <div key={job.title} className="rounded border border-gray-200 p-5">
            <p className="font-semibold text-primary">{job.title}</p>
            <p className="mt-1 text-sm text-gray-500">{job.location}</p>
            <p className="mt-3 text-sm text-gray-700">{job.blurb}</p>
          </div>
        ))}
      </div>
      <a
        href="tel:18006230"
        className="mt-8 inline-block rounded border border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-white"
      >
        Ứng tuyển: 1800 6230
      </a>
    </Container>
  );
}
