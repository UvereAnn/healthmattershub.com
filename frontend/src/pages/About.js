import './About.css';

const SITE_NAME = process.env.REACT_APP_SITE_NAME || 'HealthBlog';

export default function About() {
  return (
    <div className="page-wrapper">
      <div className="about-hero">
        <div className="container">
          <h1>About {SITE_NAME}</h1>
          <p>Our mission is to make evidence-based health information accessible to everyone</p>
        </div>
      </div>
      <div className="container about-content">
        <div className="about-grid">
          <div className="about-text">
            <h2>Who We Are</h2>
            <p>
              {SITE_NAME} is a dedicated health and wellness platform committed to providing
              accurate, research-backed content that helps you make informed decisions about your health.
              Our team of health enthusiasts and writers curates articles across nutrition, fitness,
              mental health, and lifestyle.
            </p>
            <h2>Our Values</h2>
            <div className="values-list">
              {[
                { icon: '🔬', title: 'Evidence-Based', desc: 'All content is grounded in scientific research and reviewed for accuracy.' },
                { icon: '💚', title: 'Holistic Approach', desc: 'We cover the full spectrum of health: body, mind, and lifestyle.' },
                { icon: '🌍', title: 'Accessible', desc: 'Complex health concepts explained in simple, engaging language.' },
                { icon: '🤝', title: 'Community-Driven', desc: 'We learn from our readers and foster an engaged health community.' },
              ].map(v => (
                <div key={v.title} className="value-card">
                  <span>{v.icon}</span>
                  <div>
                    <strong>{v.title}</strong>
                    <p>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-sidebar">
            <div className="about-stats-card">
              <h3>By the Numbers</h3>
              <div className="about-stat"><strong>100+</strong><span>Health Articles</span></div>
              <div className="about-stat"><strong>10k+</strong><span>Monthly Readers</span></div>
              <div className="about-stat"><strong>6</strong><span>Topic Categories</span></div>
              <div className="about-stat"><strong>100%</strong><span>Free Content</span></div>
            </div>
            <div className="disclaimer-card">
              <strong>⚕️ Medical Disclaimer</strong>
              <p>Content on this site is for informational purposes only. Always consult a qualified healthcare professional before making medical decisions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
