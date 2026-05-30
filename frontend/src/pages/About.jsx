import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Compass, Users2, Trophy, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page container animate-fade-in">
      {/* Hero Header */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-tag">DISCOVER APEX WHEELS</span>
          <h1>Redefining Premium <span className="text-gradient">Mobility</span> Since 2026</h1>
          <p>
            At Apex Wheels, we believe car rental should be more than a transaction—it should be an unforgettable, seamless journey. We curate a world-class fleet of electric, luxury, and sports vehicles to elevate your travel standard.
          </p>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="stats-section grid grid-cols-4">
        <div className="card stat-card">
          <h3>15k+</h3>
          <p>Successful Trips</p>
        </div>
        <div className="card stat-card">
          <h3>99.4%</h3>
          <p>Customer Satisfaction</p>
        </div>
        <div className="card stat-card">
          <h3>10+</h3>
          <p>Premium Models</p>
        </div>
        <div className="card stat-card">
          <h3>24/7</h3>
          <p>VIP Support</p>
        </div>
      </section>

      {/* Corporate Philosophy */}
      <section className="philosophy-section">
        <div className="section-header">
          <h2>Our Core Pillars</h2>
          <p>What drives our relentless pursuit of excellence every single day.</p>
        </div>

        <div className="grid grid-cols-3">
          <div className="card pillar-card">
            <div className="pillar-icon-wrapper">
              <ShieldCheck size={28} />
            </div>
            <h3>Uncompromising Safety</h3>
            <p>Every single model in our fleet undergoes rigorous 150-point mechanical inspection and sanitization protocols prior to handoff.</p>
          </div>

          <div className="card pillar-card">
            <div className="pillar-icon-wrapper">
              <Compass size={28} />
            </div>
            <h3>Limitless Adventure</h3>
            <p>Featuring standard collision protection, unlimited miles, and flexible pick/drop packages, your journey has zero borders.</p>
          </div>

          <div className="card pillar-card">
            <div className="pillar-icon-wrapper">
              <Trophy size={28} />
            </div>
            <h3>Premium Luxury</h3>
            <p>From customizable interior lighting to high-end Nappa leather details, our fleet represents absolute road prestige.</p>
          </div>
        </div>
      </section>

      {/* Team Description / CTA */}
      <section className="cta-banner card">
        <div className="cta-content">
          <h2>Ready to experience the ultimate ride?</h2>
          <p>Explore our meticulous collection of top-tier sedans, coupes, SUVs, and future-forward EVs today.</p>
          <Link to="/cars" className="btn btn-primary">
            Explore Our Fleet
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .about-page {
          padding: 3rem 1.5rem 5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }
        
        .about-hero {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 0;
        }
        .about-tag {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .about-hero h1 {
          font-size: 3rem;
          font-weight: 800;
          margin: 1rem 0;
          line-height: 1.15;
        }
        .about-hero p {
          font-size: 1.15rem;
          color: var(--text-dark);
          line-height: 1.7;
        }

        .stats-section {
          gap: 1.5rem;
        }
        .stat-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--bg-white) 0%, var(--bg-light) 100%);
          border: 1px solid var(--border);
        }
        .stat-card h3 {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }
        .stat-card p {
          font-size: 0.95rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .philosophy-section {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .pillar-card {
          padding: 2rem;
          background: var(--bg-white);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pillar-icon-wrapper {
          color: var(--primary);
          background-color: var(--primary-light);
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pillar-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .pillar-card p {
          color: var(--text-dark);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .cta-banner {
          background: linear-gradient(135deg, hsl(220, 40%, 96%) 0%, hsl(220, 30%, 98%) 100%);
          padding: 4rem 2rem;
          text-align: center;
          border-left: 6px solid var(--primary);
        }
        .cta-content {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .cta-content h2 {
          font-size: 2rem;
          font-weight: 800;
        }
        .cta-content p {
          color: var(--text-dark);
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .stats-section {
            grid-template-columns: repeat(2, 1fr);
          }
          .philosophy-section .grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 576px) {
          .about-hero h1 {
            font-size: 2.25rem;
          }
          .stats-section {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </div>
  );
};

export default About;
