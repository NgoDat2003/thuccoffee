interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-medium uppercase text-primary">{title}</h2>
      {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
    </div>
  );
}
