import Image from 'next/image';

interface FeatureCardProps {
  title: string;
  description: string;
  imageSrc: string;
}

const FeatureCard = ({ title, description, imageSrc }: FeatureCardProps) => {
  return (
    <div
      role="article"
      tabIndex={0}
      className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-6 focus:outline-none focus:ring-2 focus:ring-featureBlue focus:ring-offset-2 focus:ring-offset-background transition-shadow"
      aria-labelledby={`feature-title-${title
        .toLowerCase()
        .replace(/\s+/g, '-')}`}
    >
      <div className="min-h-[120px]">
        <h3
          id={`feature-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-xl font-semibold text-white mb-2"
        >
          {title}
        </h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>
      <div className="h-[200px] w-full flex items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={`Illustration for ${title}`}
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
