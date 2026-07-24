interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-[30px] text-left">
      <h2 className="text-2xl font-medium leading-[28.8px] uppercase text-primary">{title}</h2>
      {subtitle && <p className="mt-2 text-lg italic leading-6 text-[#292929]">{subtitle}</p>}
    </div>
  );
}
