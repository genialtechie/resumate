import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-black/70 backdrop-blur-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="block"
          >
            <Image
              src="/logo-white.svg"
              alt="qualifies.me"
              width={120}
              height={30}
              className="h-6 w-auto brightness-200"
            />
          </Link>
          <span className="text-sm text-gray-400">
            Copyright © 2024 Magpollo
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="https://twitter.com/magpollo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Image
              src="/x-logo.svg"
              alt="X (Twitter)"
              width={20}
              height={20}
              className="h-5 w-5 invert"
            />
          </Link>
          <Link
            href="https://discord.gg/magpollo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Image
              src="/discord-logo.svg"
              alt="Discord"
              width={20}
              height={20}
              className="h-5 w-5 invert"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
