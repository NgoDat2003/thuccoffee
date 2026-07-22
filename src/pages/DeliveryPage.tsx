import Container from '../components/ui/Container';
import { pages } from '../data/pages';
import { getImageUrl } from '../lib/image-url';
import { usePageMeta } from '../lib/use-page-meta';

export default function DeliveryPage() {
  usePageMeta('Đặt hàng online', 'Đặt món từ Thức Coffee và nhận hàng tận nơi 24/7.');

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{pages.delivery.heading}</h1>
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div>
          <p className="text-xl font-semibold text-primary">{pages.delivery.freeship}</p>
          <p className="mt-4 text-gray-700">{pages.delivery.intro}</p>
          <div className="mt-4 flex flex-col items-start gap-3">
            {pages.delivery.channels.map((channel) => (
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
          <p className="mt-5 font-medium text-gray-700">{pages.delivery.deliveryTime}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {pages.delivery.codes.map((promotion) => (
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
