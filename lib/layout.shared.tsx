import Image from 'next/image';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

// Nav mirrors the marketing site's logo + "nexalware" wordmark pattern
// (see frontend/src/components/navbar.tsx), reading as the docs site by
// appending a dimmer "docs" label instead of duplicating the whole brand.
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      url: '/',
      title: (
        <>
          <Image
            src="/logo-dark.jpeg"
            alt="nexalware"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="font-semibold tracking-tight text-white">
            nexalware
          </span>
          <span className="font-normal text-white/40">docs</span>
        </>
      ),
    },
    // Dark-mode only brand - no light/dark toggle.
    themeSwitch: {
      enabled: false,
    },
    links: [
      {
        type: 'main',
        text: 'nexalware.com',
        url: 'https://nexalware.com',
        external: true,
      },
    ],
  };
}
