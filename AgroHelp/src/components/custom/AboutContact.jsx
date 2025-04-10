import React, { useState } from 'react';
import '../../css/AboutContact.css';

function AboutContact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('');

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    // Create a Gmail specific mailto link
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=1si22cs136@sit.ac.in&su=${encodeURIComponent(`Contact from ${formData.name}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    
    // Open Gmail in a new tab
    window.open(mailtoLink, '_blank');
    
    // Set status to success after a short delay
    setTimeout(() => {
      setFormStatus('success');
      // Reset form after success
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      // Clear success message after 3 seconds
      setTimeout(() => setFormStatus(''), 3000);
    }, 1000);
  };

  return (
    <>
      {/* About Section */}
      <div className="about-container">
        <div className="about-section">
          <h2>About AgroHelp</h2>
          
          <div className="about-intro">
            <p className="about-tagline">
              Empowering farmers with sustainable solutions for a greener tomorrow
            </p>
          </div>
          
          <div className="about-content">
            <div className="about-mission">
              <h3><i className="mission-icon">🌱</i> Our Mission</h3>
              <p>
                At AgroHelp, we're dedicated to revolutionizing agriculture through sustainable practices 
                and smart technology. Our mission is to empower farmers with the knowledge and tools 
                they need to maximize productivity while minimizing environmental impact.
              </p>
            </div>
            
            <div className="about-features">
              <h3><i className="features-icon">🛠️</i> What We Offer</h3>
              <ul className="features-list">
                <li>
                  <strong>Personalized Crop Recommendations</strong> - Data-driven suggestions based on your soil, 
                  climate, and farming conditions
                </li>
                <li>
                  <strong>Fertilizer Guidance</strong> - Eco-friendly fertilizer recommendations tailored to your 
                  crops and soil needs
                </li>
                <li>
                  <strong>Plant Disease Detection</strong> - Advanced AI-powered plant disease identification 
                  and treatment advice
                </li>
                <li>
                  <strong>Weather Integration</strong> - Real-time weather data to inform your farming decisions
                </li>
                <li>
                  <strong>Expert Agricultural Chatbot</strong> - Get instant answers to your farming questions
                </li>
              </ul>
            </div>
            
            <div className="about-vision">
              <h3><i className="vision-icon">🌍</i> Our Vision</h3>
              <p>
                We envision a future where sustainable farming is accessible to all, where technology and 
                traditional wisdom work hand in hand, and where farmers can make informed decisions 
                that benefit both their yields and the planet. Together, we can build a more sustainable 
                agricultural ecosystem for generations to come.
              </p>
            </div>
            
            <div className="about-team">
              <h3><i className="team-icon">👨‍🌾</i> Our Team</h3>
              <p>
                AgroHelp is developed by a passionate team of agricultural experts, software developers, 
                and environmental scientists from Siddaganga Institute of Technology. We combine expertise 
                in agriculture, artificial intelligence, and sustainable practices to create tools that make 
                a real difference in farming communities.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div className="contact-container">
        <div className="contact-section">
          <h2>Contact Us</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <i className="contact-icon email-icon">✉️</i>
                <div>
                  <h3>Email Us</h3>
                  <p>1si22cs136@sit.ac.in</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="contact-icon phone-icon">📞</i>
                <div>
                  <h3>Call Us</h3>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="contact-icon location-icon">📍</i>
                <div>
                  <h3>Visit Us</h3>
                  <p>Siddaganga Institute of Technology, Tumkur</p>
                </div>
              </div>
              <div className="contact-social">
                <h3>Connect With Us</h3>
                <div className="social-icons">
                  <a href="#" className="social-icon" aria-label="Facebook">
                    <i className="social-icon-fb">📘</i>
                  </a>
                  <a href="#" className="social-icon" aria-label="Twitter">
                    <i className="social-icon-tw">🐦</i>
                  </a>
                  <a href="#" className="social-icon" aria-label="Instagram">
                    <i className="social-icon-ig">📷</i>
                  </a>
                  <a href="#" className="social-icon" aria-label="LinkedIn">
                    <i className="social-icon-ln">🔗</i>
                  </a>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <h3>Send us a Message</h3>
              <form onSubmit={handleContactSubmit}>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleContactChange}
                  placeholder="Your Name" 
                  className="contact-input" 
                  required 
                />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleContactChange}
                  placeholder="Your Email" 
                  className="contact-input" 
                  required 
                />
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleContactChange}
                  placeholder="Your Message" 
                  className="contact-textarea"
                  required
                ></textarea>
                <button type="submit" className="contact-button" disabled={formStatus === 'sending'}>
                  {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                {formStatus === 'success' && (
                  <div className="success-message">Message sent successfully!</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutContact; 