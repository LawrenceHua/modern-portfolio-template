import React from 'react';
import { render, screen } from '@testing-library/react';
import { existsSync } from 'fs';
import { join } from 'path';
import { siteConfig } from './site';
import { HeroSection } from '@/components/sections/HeroSection';
import { ContactSection } from '@/components/sections/ContactSection';

jest.mock('next/dist/server/web/exports/next-response', () => ({
  __esModule: true,
  default: {
    json: (body: unknown, options: { status: number }) => ({
      status: options.status,
      json: async () => body,
    }),
  },
}));
jest.mock('resend', () => ({ Resend: jest.fn() }));
jest.mock('react-datepicker', () => () => null);
jest.mock('framer-motion', () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    motion: new Proxy(
      {},
      {
        get:
          (_, tag) =>
          ({
            children,
            className,
            id,
            style,
            href,
            onClick,
            type,
            disabled,
          }: Record<string, unknown>) =>
            React.createElement(
              tag,
              { className, id, style, href, onClick, type, disabled },
              children
            ),
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useReducedMotion: () => true,
    useInView: () => true,
  };
});

it('renders a changed identity, title, and social link from the single config', () => {
  const previous = {
    name: siteConfig.name,
    title: siteConfig.title,
    linkedin: siteConfig.links.linkedin,
  };
  siteConfig.name = 'Sample Designer';
  siteConfig.title = 'Illustrator';
  siteConfig.links.linkedin = 'https://example.com/designer';
  try {
    render(React.createElement(HeroSection));
    expect(
      screen.getByRole('heading', { name: 'Sample Designer' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Illustrator').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('img', { name: 'Sample Designer' })
    ).toHaveAttribute('src', siteConfig.images.profile);
    expect(
      document.querySelector('a[href="https://example.com/designer"]')
    ).not.toBeNull();
  } finally {
    siteConfig.name = previous.name;
    siteConfig.title = previous.title;
    siteConfig.links.linkedin = previous.linkedin;
  }
});

it('ships real local placeholder assets for configured images', () => {
  for (const asset of [
    siteConfig.images.profile,
    siteConfig.images.project,
    siteConfig.images.icon,
  ]) {
    expect(existsSync(join(process.cwd(), 'public', asset))).toBe(true);
  }
  for (const project of siteConfig.projectsData.all) {
    expect(existsSync(join(process.cwd(), 'public', project.image))).toBe(true);
  }
});

it('shows an honest unavailable state for unconfigured scheduling', () => {
  expect(siteConfig.features.scheduling).toBe(false);
  render(React.createElement(ContactSection, { externalFormType: 'calendar' }));
  expect(screen.getByRole('status')).toHaveTextContent(
    'Scheduling is not configured'
  );
});

it('does not report successful contact delivery without the email service', async () => {
  const request = {
    json: async () => ({
      name: 'Example Visitor',
      email: 'visitor@example.com',
      subject: 'Hello',
      message: 'Sample message',
    }),
  };
  const previous = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  const { POST } = await import('@/app/api/contact/route');
  const response = await POST(request as Parameters<typeof POST>[0]);
  if (previous !== undefined) process.env.RESEND_API_KEY = previous;
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual(
    expect.objectContaining({
      error: expect.stringContaining('not configured'),
    })
  );
});
