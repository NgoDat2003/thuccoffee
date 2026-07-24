import Container from '../components/ui/Container';
import { StaticPageError, StaticPageLoading } from '../components/ui/StaticPageState';
import type { DeliveryPageContent } from '../data/pages';
import { getImageUrl } from '../lib/image-url';
import { usePageMeta } from '../lib/use-page-meta';
import { useStaticPage } from '../services/static-pages.service';

export default function DeliveryPage() {
  usePageMeta('Đặt hàng online', 'Đặt món từ Thức Coffee và nhận hàng tận nơi 24/7.');
  const { data: page, isLoading, isError } = useStaticPage<DeliveryPageContent>('delivery');

  if (isLoading) return <StaticPageLoading />;
  if (isError || !page) return <StaticPageError />;
  const content = page.data;

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{content.heading}</h1>
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div>
          <p className="text-xl font-semibold text-primary">{content.freeship}</p>
          <p className="mt-4 text-gray-700">{content.intro}</p>
          <div className="mt-4 flex flex-col items-start gap-3">
            {content.channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
                className="rounded border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
              >
                {channel.label}
              </a>
            ))}
          </div>
          <p className="mt-5 font-medium text-gray-700">{content.deliveryTime}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {content.codes.map((promotion) => (
              <div key={promotion.code} className="rounded bg-gray-50 p-4">
                <p className="font-bold text-primary">{promotion.code}</p>
                <p className="mt-2 text-sm text-gray-700">{promotion.description}</p>
              </div>
            ))}
          </div>
        </div>
        <img src={getImageUrl('blog/249fc9a9_post-17042023.png')} alt="Chương trình Thức Delivery" className="w-full rounded" />
      </div>
    </Container>
  );
}
