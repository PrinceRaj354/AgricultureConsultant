import React, { useState } from 'react';
import Header from './Header';
import Chatbot from './Chatbot';
import '../../css/Layout.css';

// Layout component to be used on feature pages
function Layout({ children }) {
  const [showChatbot, setShowChatbot] = useState(false);
  
  const toggleChatbot = () => {
    setShowChatbot(prevState => !prevState);
  };

  return (
    <div className="layout">
      <Header />
      
      <div className="feature-content">
        {children}
      </div>
      
      {/* Floating chatbot button */}
      <div className="chatbot-float-button" onClick={toggleChatbot}>
        <div className="chatbot-float-icon">
          💬
        </div>
      </div>
      
      {/* Chatbot modal */}
      {showChatbot && (
        <div className="chatbot-modal-overlay" onClick={(e) => {
          if (e.target.className === 'chatbot-modal-overlay') {
            setShowChatbot(false);
          }
        }}>
          <div className="chatbot-modal">
            <div className="chatbot-modal-header">
              <h3>AgroBot - Agricultural Assistant</h3>
              <button className="close-button" onClick={() => setShowChatbot(false)}>✕</button>
            </div>
            <div className="chatbot-modal-content">
              <Chatbot />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout; 