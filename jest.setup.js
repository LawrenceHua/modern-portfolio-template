import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, fill, blurDataURL, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    h4: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
    h5: ({ children, ...props }) => <h5 {...props}>{children}</h5>,
    h6: ({ children, ...props }) => <h6 {...props}>{children}</h6>,
    ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }) => <li {...props}>{children}</li>,
    section: ({ children, ...props }) => (
      <section {...props}>{children}</section>
    ),
    article: ({ children, ...props }) => (
      <article {...props}>{children}</article>
    ),
    aside: ({ children, ...props }) => <aside {...props}>{children}</aside>,
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    header: ({ children, ...props }) => <header {...props}>{children}</header>,
    footer: ({ children, ...props }) => <footer {...props}>{children}</footer>,
    main: ({ children, ...props }) => <main {...props}>{children}</main>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    input: (props) => <input {...props} />,
    textarea: (props) => <textarea {...props} />,
    select: ({ children, ...props }) => <select {...props}>{children}</select>,
    option: ({ children, ...props }) => <option {...props}>{children}</option>,
    label: ({ children, ...props }) => <label {...props}>{children}</label>,
    a: ({ children, ...props }) => <a {...props}>{children}</a>,
    img: (props) => <img {...props} />,
    svg: ({ children, ...props }) => <svg {...props}>{children}</svg>,
    path: (props) => <path {...props} />,
    circle: (props) => <circle {...props} />,
    rect: (props) => <rect {...props} />,
    line: (props) => <line {...props} />,
    polygon: (props) => <polygon {...props} />,
    polyline: (props) => <polyline {...props} />,
    ellipse: (props) => <ellipse {...props} />,
    g: ({ children, ...props }) => <g {...props}>{children}</g>,
    defs: ({ children, ...props }) => <defs {...props}>{children}</defs>,
    clipPath: ({ children, ...props }) => (
      <clipPath {...props}>{children}</clipPath>
    ),
    linearGradient: ({ children, ...props }) => (
      <linearGradient {...props}>{children}</linearGradient>
    ),
    radialGradient: ({ children, ...props }) => (
      <radialGradient {...props}>{children}</radialGradient>
    ),
    stop: (props) => <stop {...props} />,
    mask: ({ children, ...props }) => <mask {...props}>{children}</mask>,
    pattern: ({ children, ...props }) => (
      <pattern {...props}>{children}</pattern>
    ),
    symbol: ({ children, ...props }) => <symbol {...props}>{children}</symbol>,
    use: (props) => <use {...props} />,
    text: ({ children, ...props }) => <text {...props}>{children}</text>,
    tspan: ({ children, ...props }) => <tspan {...props}>{children}</tspan>,
    foreignObject: ({ children, ...props }) => (
      <foreignObject {...props}>{children}</foreignObject>
    ),
  },
  AnimatePresence: ({ children }) => children,
  useInView: () => ({ ref: jest.fn(), inView: true }),
  useReducedMotion: () => false,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
  useSpring: (value) => value,
  useMotionValue: (initial) => ({ get: () => initial, set: jest.fn() }),
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();
