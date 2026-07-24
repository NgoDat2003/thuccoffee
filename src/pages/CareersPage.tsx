import Container from '../components/ui/Container';
import { StaticPageError, StaticPageLoading } from '../components/ui/StaticPageState';
import type { CareersPageContent } from '../data/pages';
import { usePageMeta } from '../lib/use-page-meta';
import { useStaticPage } from '../services/static-pages.service';

export default function CareersPage() {
  usePageMeta('Tuyển dụng', 'Cơ hội việc làm tại Thức Coffee.');
  const { data: page, isLoading, isError } = useStaticPage<CareersPageContent>('careers');

  if (isLoading) return <StaticPageLoading />;
  if (isError || !page) return <StaticPageError />;
  const content = page.data;
  const sharedJob = content.jobs[0];

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{content.heading}</h1>
      <div className="max-w-4xl space-y-4 text-gray-700">
        <p>{content.intro}</p>
        <p className="rounded border-l-4 border-primary bg-gray-50 p-4">{content.notice}</p>
        {sharedJob && (
          <a
            href={sharedJob.applyLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block font-semibold text-primary hover:underline"
          >
            {content.applyText}
          </a>
        )}
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-semibold text-primary">{content.rolesHeading}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.jobs.map((job) => (
            <div key={job.title} className="rounded border border-gray-200 p-4 font-semibold text-gray-800">
              {job.title}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded border border-gray-200 p-5">
          <h2 className="mb-3 font-semibold text-primary">{content.shiftsHeading}</h2>
          <ul className="space-y-2 text-gray-700">
            {sharedJob?.shift.split(' · ').map((shift) => <li key={shift}>- {shift}</li>)}
            {content.jobs[3] && <li>- BẢO VỆ: {content.jobs[3].shift}</li>}
          </ul>
        </div>
        <div className="space-y-4 rounded border border-gray-200 p-5 text-gray-700">
          <p>{content.area}</p>
          <p>{content.benefits}</p>
          <p>{content.responseTime}</p>
          <p>{content.support}</p>
        </div>
      </section>
      <p className="mt-6 text-sm text-gray-500">{content.hashtags}</p>
    </Container>
  );
}
