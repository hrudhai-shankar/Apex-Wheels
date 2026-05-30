import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <Car size={28} className="logo-icon" />
            <span>Apex<span className="logo-accent">Wheels</span></span>
          </Link>
          <p className="footer-desc">
            Experience absolute freedom on the road with our premium fleet of highly-maintained rental cars, customized to fit your travel needs.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cars">Browse Cars</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>Contact Info</h3>
          <ul>
            <li>
              <Phone size={18} />
              <span>+1 (555) 019-2834</span>
            </li>
            <li>
              <Mail size={18} />
              <span>support@apexwheels.com</span>
            </li>
            <li>
              <MapPin size={18} />
              <span>100 Innovation Way, Suite A</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Apex Wheels Car Rentals. All rights reserved.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .footer {
          background-color: var(--dark);
          color: hsl(210, 20%, 80%);
          padding: 4rem 0 0 0;
          margin-top: auto;
          border-top: 1px solid var(--dark-light);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          padding-bottom: 3rem;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--bg-white);
        }
        .footer-desc {
          font-size: 0.95rem;
          line-height: 1.6;
          color: hsl(210, 20%, 70%);
        }
        .footer-links h3, .footer-contact h3 {
          color: var(--bg-white);
          font-size: 1.1rem;
          margin-bottom: 1.25rem;
          font-weight: 600;
        }
        .footer-links ul, .footer-contact ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .footer-links a {
          transition: var(--transition-fast);
          font-size: 0.95rem;
        }
        .footer-links a:hover {
          color: var(--primary-light);
          padding-left: 4px;
        }
        .footer-contact li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
        }
        .footer-bottom {
          border-top: 1px solid var(--dark-light);
          padding: 1.5rem 0;
          text-align: center;
          font-size: 0.85rem;
          color: hsl(210, 20%, 60%);
        }
      `}} />
    </footer>
  );
};

export default Footer;
