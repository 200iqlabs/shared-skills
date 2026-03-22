// Section Component Template for Vibe Coding
// Copy and customize this template for page sections

import { motion } from 'framer-motion';

const SectionTemplate = () => {
  return (
    <section
      id="section-name"
      className="relative min-h-screen py-20 px-4 md:px-8 lg:px-16"
    >
      {/* Decorative background blurs - optional */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent-neon/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-accent-neon via-accent-cyan to-accent-neon bg-clip-text text-transparent">
              Section Title
            </span>
          </h2>
          <p className="text-neutral-400 text-lg mt-4 max-w-2xl mx-auto">
            Section description goes here. Explain what this section is about.
          </p>
        </motion.div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Replace with your content */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: item * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-6 hover:border-accent-neon/30 transition-all duration-300"
            >
              <p className="text-white">Item {item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionTemplate;
