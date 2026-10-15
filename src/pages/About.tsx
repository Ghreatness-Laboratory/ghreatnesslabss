import React from 'react';
import { Building2, Target, Eye, Shapes } from 'lucide-react';
import { SectionHead, Stats } from '../components/SharedSections';

export default function About() {
  return (
    <>
      <section className="section page-intro">
        <SectionHead
          label="About GhreatnessLabs"
          title="Built in Lagos for"
          accent="important work."
          copy="We are an independent digital and IT solutions studio for teams that need clarity, craft, and capable delivery in equal measure."
        />
        <div className="story-grid">
          <article>
            <span className="icon-badge">
              <Building2 />
            </span>
            <h3>How we started</h3>
            <p>
              Founded in Lagos in 2024, GhreatnessLabs began with a simple belief: the digital systems African and global teams rely on should be as considered as their ambition.
            </p>
          </article>
          <article className="story-dark">
            <span className="icon-badge">
              <Target />
            </span>
            <h3>Our mission</h3>
            <p>
              Make high-impact work more coherent—bringing strategy, identity, product design, engineering, and infrastructure into one accountable studio practice.
            </p>
          </article>
          <article>
            <span className="icon-badge">
              <Eye />
            </span>
            <h3>Our vision</h3>
            <p>
              To be the trusted African studio behind the digital systems and brands shaping what comes next.
            </p>
          </article>
          <article className="story-dark">
            <span className="icon-badge">
              <Shapes />
            </span>
            <h3>What we do</h3>
            <p>
              We partner with founders, institutions, and established teams to create products, brands, and operational foundations made to endure.
            </p>
          </article>
        </div>
      </section>
      <Stats />
    </>
  );
}
