import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const Home = () => {

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container animate-fade-in">
          <div className="hero-content">
            <span className="hero-tag">PREMIUM CAR RENTALS</span>
            <h1>Find Your <span className="text-gradient">Perfect</span> Ride For Any Journey</h1>
            <p>
              Unlock the finest car rental experience. From sleek electric sedans to spacious adventure SUVs, Apex Wheels delivers luxury, flexibility, and absolute peace of mind.
            </p>
            <div className="hero-actions">
              <Link to="/cars" className="btn btn-primary">
                Book A Car Now
                <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn btn-secondary">Learn More</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"
                alt="Premium Lamborghini Urus gold metallic"
              />
              <div className="hero-badge animate-fade-in">
                <Star className="star-icon" size={18} />
                <div>
                  <h4>4.9 / 5</h4>
                  <p>12k+ Positive Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .home-page {
          overflow-x: hidden;
        }
        .hero-section {
          background-color: var(--bg-white);
          padding: 7rem 0;
          border-bottom: 1px solid var(--border);
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 4rem;
          align-items: center;
        }
        @media (max-width: 992px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .hero-tag {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: var(--primary);
          text-transform: uppercase;
        }
        .hero-content h1 {
          font-size: 3.5rem;
          line-height: 1.1;
          letter-spacing: -0.03em;
          font-weight: 800;
          color: var(--dark);
        }
        @media (max-width: 576px) {
          .hero-content h1 {
            font-size: 2.5rem;
          }
        }
        .hero-content p {
          font-size: 1.15rem;
          color: var(--text-muted);
          line-height: 1.65;
        }
        .hero-actions {
          display: flex;
          gap: 1.25rem;
          margin-top: 0.75rem;
        }
        @media (max-width: 992px) {
          .hero-actions {
            justify-content: center;
          }
        }
        .hero-visual {
          position: relative;
        }
        .hero-image-wrapper {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(38, 62, 52, 0.2);
          border: 1px solid rgba(197, 160, 89, 0.25);
          aspect-ratio: 4/3;
          transition: var(--transition);
        }
        .hero-image-wrapper:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px -10px rgba(197, 160, 89, 0.2);
          border-color: var(--primary);
        }
        .hero-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-badge {
          position: absolute;
          bottom: 2rem;
          left: 2rem;
          background: rgba(5, 5, 5, 0.85);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(197, 160, 89, 0.3);
          padding: 0.85rem 1.5rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: var(--shadow-lg);
          color: white;
        }
        .star-icon {
          color: var(--primary);
          fill: var(--primary);
        }
        .hero-badge h4 {
          font-size: 1.1rem;
          margin-bottom: 0.1rem;
          color: white;
        }
        .hero-badge p {
          font-size: 0.8rem;
          color: hsl(0, 0%, 75%);
          font-weight: 600;
        }
        
        .section-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 3.5rem auto;
        }
        .section-header h2 {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }
        .section-header p {
          color: var(--text-muted);
          font-size: 1.05rem;
        }
        
        .features-section, .featured-section {
          padding: 5rem 0;
        }
        .features-section {
          background-color: var(--secondary);
          border-bottom: 1px solid var(--border);
        }
        .feature-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }
        .feature-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .feature-icon-wrapper.shield {
          background-color: var(--success-light);
          color: var(--success);
        }
        .feature-icon-wrapper.clock {
          background-color: hsl(238, 83%, 95%);
          color: var(--primary);
        }
        .feature-icon-wrapper.zap {
          background-color: hsl(38, 92%, 95%);
          color: var(--warning);
        }
        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .feature-card p {
          font-size: 0.95rem;
          color: var(--text-muted);
        }
        
        .empty-featured {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default Home;
