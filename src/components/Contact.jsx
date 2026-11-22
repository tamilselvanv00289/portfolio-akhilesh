import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Fade } from 'react-awesome-reveal';
import Header from './Header';
import Social from './Social';
import FallbackSpinner from './FallbackSpinner';
import endpoints from '../constants/endpoints';
import '../css/contact.css';

function Contact(props) {
  const { header } = props;
  const [contactData, setContactData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    success: false,
    message: '',
  });

  useEffect(() => {
    fetch(endpoints.contact, { method: 'GET' })
      .then((res) => res.json())
      .then((res) => setContactData(res))
      .catch((err) => err);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({
        submitting: false,
        submitted: true,
        success: false,
        message: 'Please fill in all required fields (Name, Email, and Message).',
      });
      return;
    }

    setStatus({ submitting: true, submitted: false, success: false, message: '' });

    try {
      const response = await fetch('https://formsubmit.co/ajax/akhileshaitham28@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || `New Portfolio Message from ${formData.name}`,
          message: formData.message,
          _subject: `Portfolio Message from ${formData.name}`,
          _autoresponse: `Hello ${formData.name},\n\nThank you for reaching out to Akhilesh A! Your message has been safely received, and Akhilesh will get back to you soon.\n\nSummary of your message:\nSubject: ${formData.subject || 'Portfolio Inquiry'}\nMessage:\n${formData.message}\n\nBest regards,\nAkhilesh A\nFull Stack Web Developer\nEmail: akhileshaitham28@gmail.com\nLinkedIn: https://www.linkedin.com/in/akhilesh-aitham-835870358`,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      const result = await response.json();

      if (response.ok || result.success === 'true' || result.success === true) {
        setStatus({
          submitting: false,
          submitted: true,
          success: true,
          message: `Thank you, ${formData.name}! Your message has been sent to Akhilesh A. A confirmation receipt has also been sent to ${formData.email}.`,
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({
          submitting: false,
          submitted: true,
          success: false,
          message: result.message || 'Something went wrong. Please try again or email directly at akhileshaitham28@gmail.com.',
        });
      }
    } catch (error) {
      setStatus({
        submitting: false,
        submitted: true,
        success: false,
        message: 'Could not connect to the form service. Please send an email directly to akhileshaitham28@gmail.com.',
      });
    }
  };

  return (
    <>
      <Header title={header || 'Contact'} />
      <div className="section-content-container">
        {contactData ? (
          <Fade triggerOnce>
            <div className="bento contact-bento">
              {/* Left Column: Direct Contact Details & Links */}
              <div className="tile contact-info-tile span-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div className="contact-status-badge">
                    <span className="status-dot" />
                    <span>{contactData.availability || 'Open for Opportunities'}</span>
                  </div>

                  <h2 className="contact-info-heading">{contactData.title || 'Let\'s Connect'}</h2>
                  <p className="contact-info-subheading">
                    {contactData.subtitle}
                  </p>
                </div>

                <div className="contact-details-list">
                  {/* Direct Email */}
                  <a
                    href={`mailto:${contactData.email}`}
                    className="contact-detail-item"
                    title="Send Email"
                  >
                    <div className="contact-detail-icon">✉</div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Direct Email</span>
                      <span className="contact-detail-value">{contactData.email}</span>
                    </div>
                  </a>

                  {/* LinkedIn Profile */}
                  <a
                    href={contactData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-detail-item"
                    title="Open LinkedIn"
                  >
                    <div className="contact-detail-icon">🔗</div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">LinkedIn</span>
                      <span className="contact-detail-value">Akhilesh A</span>
                    </div>
                  </a>

                  {/* Location & University */}
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon">📍</div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Location & University</span>
                      <span className="contact-detail-value">
                        {contactData.institution}
                        <br />
                        <small style={{ color: 'var(--text-muted)' }}>{contactData.location}</small>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Profiles */}
                <div className="contact-social-section">
                  <span className="contact-social-label">Connect across networks</span>
                  <Social />
                </div>
              </div>

              {/* Right Column: FormSubmit Interactive Message Form */}
              <div className="tile contact-form-tile span-4">
                <h2 className="contact-form-title">Send a Message</h2>
                <p className="contact-form-subtitle">
                  Fill in your message below. An automated confirmation copy will also be dispatched directly to your email address!
                </p>

                {status.submitted && (
                  <div
                    className={`form-alert ${
                      status.success ? 'form-alert--success' : 'form-alert--error'
                    }`}
                  >
                    {status.success ? '✅ ' : '⚠️ '}
                    {status.message}
                  </div>
                )}

                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="e.g. Alex Johnson"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Your Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="e.g. alex@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <span className="form-hint">
                      ℹ️ You will receive an automated confirmation copy at this address.
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      placeholder="e.g. Full Stack Opportunity / Project Collaboration"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="Write your message or inquiry here..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-pill btn-accent contact-submit-btn"
                    disabled={status.submitting}
                  >
                    {status.submitting ? 'Sending Message...' : 'Send Message ✉'}
                  </button>
                </form>
              </div>
            </div>
          </Fade>
        ) : (
          <FallbackSpinner />
        )}
      </div>
    </>
  );
}

Contact.propTypes = {
  header: PropTypes.string,
};

Contact.defaultProps = {
  header: 'Contact',
};

export default Contact;
