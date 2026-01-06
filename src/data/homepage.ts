export const featuredItems = [
  {
    href: "https://pomorskie.travel/",
    image: "projects/pomorskie-travel/pomorskie-travel-card.webp",
    hoverImage: "projects/pomorskie-travel/pomorskie-travel-homepage-hover.webp",
    alt: "pomorskie.travel",
  },
  {
    href: "https://teatrkomedia.pl/",
    image: "projects/teatr-komedia/teatr-komedia-card.webp",
    hoverImage: "projects/teatr-komedia/teatr-komedia-homepage-hover.webp",
    alt: "teatrkomedia.pl",
  },
  {
    href: "https://ecs.gda.pl/",
    image: "projects/ecs/ecs-card.webp",
    hoverImage: "projects/ecs/ecs-homepage-hover.webp",
    alt: "ecs.gda.pl",
  },
  {
    href: "https://muzykatradycyjna.pl/",
    image: "projects/muzyka-tradycyjna/muzyka-tradycyjna-card.webp",
    hoverImage:
      "projects/muzyka-tradycyjna/muzyka-tradycyjna-homepage-hover.webp",
    alt: "muzykatradycyjna.pl",
  },
  {
    href: "https://muzeumsopotu.pl/",
    image: "projects/muzeum-sopotu/muzeum-sopotu-card.webp",
    hoverImage: "projects/muzeum-sopotu/muzeum-sopotu-homepage-hover.webp",
    alt: "muzeumsopotu.pl",
  },
  {
    href: "https://hevelianum.pl/",
    image: "projects/hevelianum/hevelianum-card.webp",
    hoverImage: "projects/hevelianum/hevelianum-homepage-hover.webp",
    alt: "hevelianum.pl",
  },
  {
    href: "https://miastoliteratury.com/",
    image: "projects/miasto-literatury/miasto-literatury-card.webp",
    hoverImage: "projects/miasto-literatury/miasto-literatury-homepage-hover.webp",
    alt: "miastoliteratury.com",
  },
  {
    href: "https://teatrstary.eu/",
    image: "projects/teatr-stary/teatr-stary-card.webp",
    hoverImage: "projects/teatr-stary/teatr-stary-homepage-hover.webp",
    alt: "teatrstary.eu",
  },
  {
    href: "https://nimit.pl/",
    image: "projects/nimit/nimit-card.webp",
    hoverImage: "projects/nimit/nimit-homepage-hover.webp",
    alt: "nimit.pl",
  },
  {
    href: "https://mt514.pl/",
    image: "projects/mt514/mt514-card.webp",
    hoverImage: "projects/mt514/mt514-homepage-hover.webp",
    alt: "mt514.pl",
  },
  {
    href: "https://dkpraga.pl/",
    image: "projects/dkpraga/dkpraga-card.webp",
    hoverImage: "projects/dkpraga/dkpraga-homepage-hover.webp",
    alt: "dkpraga.pl",
  },
  {
    href: "https://teatrgombrowicza.art.pl/",
    image: "projects/teatr-miejski/teatr-miejski-card.webp",
    hoverImage: "projects/teatr-miejski/teatr-miejski-homepage-hover.webp",
    alt: "teatrgombrowicza.art.pl",
  },
];

export const openSourceItems = [
  {
    title: "zavyn",
    description:
      "Modular WordPress framework designed for clean architecture, predictable behavior, and administration.",
    hoverImage: "open-source/zavyn/zavyn-screen-hover.webp",
    technologies: [
      "icon-php",
      "icon-wordpress",
      "icon-typescript",
      "icon-docker",
    ],
    link: {
      href: "https://github.com/zawadzki/zavyn",
      label: "check on github",
    },
  },
  {
    title: "nukBook",
    description:
      "Goodreads inspired social book-focused app with reviews, shelves, and discovery.",
    hoverImage: "open-source/nukbook/nukbook-screen-hover.webp",
    technologies: [
      "icon-python",
      "icon-fastapi",
      "icon-react",
      "icon-nextjs",
      "icon-tailwindcss",
    ],
    link: {
      href: "https://github.com/zawadzki/nukbook",
      label: "check on github",
    },
  },
  {
    title: "wp-boilerplate",
    description:
      "Opinionated boilerplate for WordPress, great starting point for developing custom themes.",
    technologies: [
      "icon-wordpress",
      "icon-typescript",
      "icon-vitejs",
      "icon-docker",
    ],
    link: {
      href: "https://github.com/zawadzki/wp-boilerplate",
      label: "check on github",
    },
  },
];

export const aboutData = {
  photo: {
    src: "/me.webp",
    alt: "Damian Zawadzki",
    crt: true,
  },
  paragraphs: [
    "Starting as young passionate, now with over a decade of experience, I've worked on diverse projects that sharpen my skills in both front-end and back-end development.",
    "My journey has equipped me with a deep understanding of various technologies, allowing me to tackle complex challenges with confidence. I prioritize attention to detail, ensuring that every implemented feature enhances user experience.",
    "My passion for full-stack development drives me to continuously learn, adapting to the ever-evolving tech landscape.",
  ],
  location: "Based in Kielce, Poland",
  timeline: [
    {
      time: "2025-2026",
      company: "FCG Apps",
      role: "WordPress developer",
      description:
        "Developed and maintained custom WordPress themes and plugins with a focus on performance and accessibility. Collaborated with designers and content teams to ship polished marketing sites and landing pages. Improved build workflows and content editing experiences for clients.",
    },
    {
      time: "2020-2025",
      company: "in+ui",
      role: "Full-stack developer",
      description:
        "Developed websites for theatres, museums, and public institutions, covering both front-end and back-end. Accessibility and usability were the top priorities, shaping design decisions and technical implementation. Collaborated closely with graphic designers and project managers throughout delivery.",
    },
    {
      time: "2013-2020",
      company: "zjednoczenie.com",
      role: "Front-end developer",
      description:
        "Delivered responsive, high-fidelity interfaces for marketing and content-heavy websites. Worked closely with designers to implement animations, interactions, and accessible layouts. Optimized front-end performance and cross-browser consistency.",
    },
    {
      time: "2011-2013",
      company: "Freelancer / Studio KLAPS",
      role: "Web developer",
      description:
        "My first steps into web development, taking on small projects for friends of friends. Handled end-to-end delivery for simple sites, from planning to launch, often building custom templates and basic CMS setups. Managed early client feedback, updates, and ongoing support.",
    },
  ],
};

export const contactData = {
  title: "Let's stay in touch",
  subtitle: "Always open to new projects and conversations.",
  buttons: [
    {
      href: "mailto:hello@zawdam.dev",
      label: "say hi",
      iconClass: "icon-mail",
    },
    {
      href: "https://github.com/zawadzki?tab=repositories",
      label: "my repo",
      iconClass: "icon-github",
    },
  ],
};
