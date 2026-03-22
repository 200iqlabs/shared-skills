// Glassmorphic Card Component Template for Vibe Coding
// Copy and customize this template for card-based layouts

import { motion } from 'framer-motion';

const CardTemplate = ({ image, title, description, tags, link }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="
        bg-white/5 backdrop-blur-xs
        border border-white/10
        rounded-xl overflow-hidden
        transition-all duration-300
        hover:border-accent-neon/30
        hover:shadow-[0_0_30px_rgba(0,255,157,0.15)]
        group
      "
    >
      {/* Image */}
      {image && (
        <div className="relative w-full aspect-video overflow-hidden bg-neutral-800">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-semibold text-white group-hover:text-accent-neon transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-neutral-400 mt-2 line-clamp-3">
          {description}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="
                  px-3 py-1 text-xs
                  bg-accent-neon/10 text-accent-neon
                  rounded-full
                  border border-accent-neon/20
                "
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Link/Button - optional */}
        {link && (
          <a
            href={link}
            className="
              inline-block mt-6
              text-accent-neon hover:text-accent-cyan
              transition-colors
              font-medium
            "
          >
            Learn more →
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default CardTemplate;

/*
Usage Example:

import CardTemplate from './CardTemplate';

const cards = [
  {
    image: "/images/project1.jpg",
    title: "Project Name",
    description: "A brief description of the project and what it does.",
    tags: ["React", "Tailwind", "Framer Motion"],
    link: "/projects/project-1"
  },
  // ... more cards
];

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {cards.map((card, index) => (
    <CardTemplate key={index} {...card} />
  ))}
</div>
*/
