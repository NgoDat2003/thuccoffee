import Container from '../components/ui/Container';
import { pages } from '../data/pages';
import { usePageMeta } from '../lib/use-page-meta';

export default function CareersPage() {
  usePageMeta('Tuyển dụng', 'Cơ hội việc làm tại Thức Coffee.');

  const sharedJob = pages.jobs[0];

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{pages.careers.heading}</h1>
      <div className="max-w-4xl space-y-4 text-gray-700">
        <p>{pages.careers.intro}</p>
        <p className="rounded border-l-4 border-primary bg-gray-50 p-4">{pages.careers.notice}</p>
        <a
          href={sharedJob.applyLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block font-semibold text-primary hover:underline"
        >
          {pages.careers.applyText}
        </a>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-semibold text-primary">{pages.careers.rolesHeading}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pages.jobs.map((job) => (
            <div key={job.title} className="rounded border border-gray-200 p-4 font-semibold text-gray-800">
              {job.title}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded border border-gray-200 p-5">
          <h2 className="mb-3 font-semibold text-primary">{pages.careers.shiftsHeading}</h2>
          <ul className="space-y-2 text-gray-700">
            {sharedJob.shift.split(' · ').map((shift) => <li key={shift}>- {shift}</li>)}
            <li>- BẢO VỆ: {pages.jobs[3].shift}</li>
          </ul>
        </div>
        <div className="space-y-4 rounded border border-gray-200 p-5 text-gray-700">
          <p>{pages.careers.area}</p>
          <p>{pages.careers.benefits}</p>
          <p>{pages.careers.responseTime}</p>
          <p>{pages.careers.support}</p>
        </div>
      </section>
      <p className="mt-6 text-sm text-gray-500">{pages.careers.hashtags}</p>
    </Container>
  );
}
