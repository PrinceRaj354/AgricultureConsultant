import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useLocation } from 'react-router-dom';
import '../../css/Chatbot.css';

// Initialize the Gemini API with the provided key
const apiKey = "AIzaSyDqCcGio6G_eRVH7SCwEnr1TxqCbWPIGeA";
const genAI = new GoogleGenerativeAI(apiKey);

// Create model with the same configuration as in AIModal.jsx
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

// Maximum number of retries
const MAX_RETRIES = 3;

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();

  // Initialize chat session and speech recognition
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const session = model.startChat({
          generationConfig,
          history: [],
        });
        setChatSession(session);
        setIsInitializing(false);
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
        setIsInitializing(false);
      }
    };
    
    initializeChat();
    
    // Initialize speech recognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInput(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
    }
    
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, []);

  // Function to handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setShowImagePreview(true);
  };

  // Function to remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setShowImagePreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Convert image to base64 for preview
  const getImagePreview = () => {
    if (!selectedImage) return null;
    return URL.createObjectURL(selectedImage);
  };

  // Convert image to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Toggle voice input
  const toggleListening = () => {
    if (!speechRecognition) return;
    
    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      setInput('');
      speechRecognition.start();
      setIsListening(true);
      // Enable voice response when voice input is used
      setVoiceEnabled(true);
    }
  };

  // Toggle speech output
  const toggleSpeech = () => {
    setVoiceEnabled(!voiceEnabled);
    
    // If turning off while speaking, stop current speech
    if (voiceEnabled && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speak text using browser's speech synthesis
  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean up text for better speech (remove markdown and formatting)
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/-\s/g, ', ')
      .replace(/\d+\.\s/g, ', ');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get available voices and select a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      (voice.lang.includes('en') && voice.name.includes('Female')) || 
      voice.name.includes('Google') || 
      voice.lang.includes('en')
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Handle voice state
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  // Get voices when they're loaded
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    // Load voices
    if (window.speechSynthesis) {
      loadVoices();
      
      // Some browsers need this event to get voices
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
    
    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add overflow checking to prevent UI overlapping issues
  useEffect(() => {
    const checkOverflow = () => {
      const container = messagesContainerRef.current;
      if (!container) return;
      
      // Add/remove a class based on whether scrolling is needed
      if (container.scrollHeight > container.clientHeight) {
        container.classList.add('scrollable');
      } else {
        container.classList.remove('scrollable');
      }
    };
    
    // Check on initial load and when messages change
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [messages]);

  // Function to generate response with retry mechanism
  const generateResponseWithRetry = async (userMessage, imageData = null, retries = 0) => {
    try {
      if (!chatSession) {
        // Try to reinitialize the chat session
        const session = model.startChat({
          generationConfig,
          history: [],
        });
        setChatSession(session);
        
        if (retries < MAX_RETRIES) {
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return generateResponseWithRetry(userMessage, imageData, retries + 1);
        } else {
          return "Could not initialize chat session after multiple attempts. Please refresh the page and try again.";
        }
      }
      
      // Send message to the chat session, with image if available
      let prompt = `As an agricultural expert, please provide advice on: ${userMessage}`;
      let result;
      
      if (imageData) {
        // If image is available, send image with the prompt
        prompt += " (I've attached an image for reference)";
        result = await chatSession.sendMessageWithImage({
          text: prompt,
          image: imageData,
        });
      } else {
        // Otherwise just send text
        result = await chatSession.sendMessage(prompt);
      }
      
      const response = await result.response;
      setRetryCount(0); // Reset retry count on success
      return response.text();
    } catch (error) {
      console.error(`Error with Gemini API (attempt ${retries + 1}):`, error);
      
      if (retries < MAX_RETRIES) {
        setRetryCount(retries + 1);
        // Wait longer between retries
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        return generateResponseWithRetry(userMessage, imageData, retries + 1);
      }
      
      // Provide fallback responses for common questions after all retries fail
      if (userMessage.toLowerCase().includes("summer") && 
          (userMessage.toLowerCase().includes("plant") || userMessage.toLowerCase().includes("grow"))) {
        return `I'm having trouble connecting to my knowledge base, but I can offer some general advice about summer planting:

Popular summer crops include:
- Tomatoes, peppers, and eggplants
- Cucumbers, zucchini, and summer squash
- Beans, corn, and okra
- Melons like watermelon and cantaloupe

For best results, consider your local climate, soil conditions, and typical last frost date. Summer crops generally need warm soil, plenty of sunlight, and regular watering, especially during hot periods.`;
      }
      
      // Fallback for plant disease questions
      if (userMessage.toLowerCase().includes("disease") || 
          userMessage.toLowerCase().includes("pest") ||
          userMessage.toLowerCase().includes("infection")) {
        return `I'm having trouble connecting to my knowledge base, but here are some general tips for plant disease management:

1. Identify the problem: Look for symptoms like spots on leaves, wilting, discoloration, or unusual growth.
2. Consider cultural controls: Proper spacing, watering at the base, and good air circulation can prevent many diseases.
3. Keep plants healthy: Stressed plants are more susceptible to diseases and pests.
4. Practice crop rotation: Don't plant the same family of crops in the same location year after year.
5. Use appropriate treatments: Consider organic options first, like neem oil or insecticidal soap.

For specific plant diseases, a photo can help with accurate diagnosis. You might want to check the plant disease detection feature in this application.`;
      }
      
      return "Sorry, I'm having trouble connecting to my knowledge base after multiple attempts. Please try again later. Error: " + error.message;
    }
  };

  // Message rendering with enhanced styling
  const renderMessage = (message, index) => {
    if (message.sender === 'bot') {
      return (
        <div 
          key={index} 
          className="bot-message"
          style={{
            ...enhancedStyles.message,
            ...enhancedStyles.botMessage
          }}
        >
          <div className="bot-message-content">
            {formatBotResponse(message.text)}
          </div>
        </div>
      );
    } else {
      return (
        <div 
          key={index} 
          className="user-message"
          style={{
            ...enhancedStyles.message,
            ...enhancedStyles.userMessage
          }}
        >
          {message.text}
          {message.image && (
            <div style={enhancedStyles.messageImage}>
              <img 
                src={message.image} 
                alt="User uploaded" 
                style={enhancedStyles.uploadedImage}
              />
            </div>
          )}
        </div>
      );
    }
  };

  // Function to format bot messages with better styling
  const formatBotResponse = (text) => {
    // Handle bullet points
    const hasBulletPoints = text.includes('- ') || text.includes('• ');
    
    // Handle numbered lists (1., 2., etc.)
    const hasNumberedList = /\d+\.\s/.test(text);
    
    // Parse markdown-style formatting in the text
    const formattedText = text
      .split('\n')
      .map((line, i) => {
        // Style headings (lines with trailing colon)
        if (line.trim().endsWith(':') && line.length < 50) {
          return <h4 key={i} style={enhancedStyles.botMessageHeading}>{line}</h4>;
        }
        
        // Style bullet points
        else if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={i} style={enhancedStyles.bulletPoint}>
              <span style={enhancedStyles.bulletIcon}>•</span>
              <span>{line.replace(/^-\s|•\s/, '')}</span>
            </div>
          );
        }
        
        // Style numbered lists
        else if (/^\d+\.\s/.test(line.trim())) {
          const num = line.match(/^\d+/)[0];
          const content = line.replace(/^\d+\.\s/, '');
          return (
            <div key={i} style={enhancedStyles.numberedItem}>
              <span style={enhancedStyles.numberIcon}>{num}.</span>
              <span>{content}</span>
            </div>
          );
        }
        
        // Regular paragraph
        else if (line.trim() !== '') {
          return <p key={i} style={enhancedStyles.paragraph}>{line}</p>;
        }
        
        // Empty line
        return null;
      })
      .filter(item => item !== null);
    
    return formattedText;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    let messageText = input.trim() || "Please analyze this image";
    let imageData = null;
    let imageUrl = null;

    // Process image if selected
    if (selectedImage) {
      try {
        // Convert image to base64 for API
        imageData = await convertImageToBase64(selectedImage);
        // Store URL for display
        imageUrl = getImagePreview();
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Failed to process image. Please try again.");
        return;
      }
    }

    // Add user message
    const userMessage = { 
      text: messageText, 
      sender: 'user',
      image: imageUrl
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setRetryCount(0);
    setSelectedImage(null);
    setShowImagePreview(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Generate and add bot response
    const response = await generateResponseWithRetry(messageText, imageData);
    setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
    setIsLoading(false);
    
    // Speak the response if voice is enabled
    if (voiceEnabled) {
      speakText(response);
    }
  };

  return (
    <div className="chatbot-container" style={enhancedStyles.container}>
      <div className="chatbot-header" style={enhancedStyles.header}>
        <h2 style={enhancedStyles.headerTitle}>AgroBot - Agricultural Assistant</h2>
        {isInitializing && <div style={enhancedStyles.initializing}>Initializing...</div>}
        <div style={enhancedStyles.voiceControls}>
          <button 
            onClick={toggleSpeech} 
            style={{
              ...enhancedStyles.voiceToggle,
              ...(voiceEnabled ? enhancedStyles.voiceEnabled : {})
            }}
            title={voiceEnabled ? "Voice output enabled" : "Voice output disabled"}
            disabled={isInitializing}
          >
            {voiceEnabled ? "🔊" : "🔇"}
          </button>
          {isSpeaking && <span style={enhancedStyles.speakingIndicator}>Speaking...</span>}
        </div>
      </div>
      
      <div 
        className="chatbot-messages" 
        style={enhancedStyles.messagesContainer}
        ref={messagesContainerRef}
      >
        {messages.length === 0 ? (
          <div style={enhancedStyles.welcomeMessage}>
            <p style={enhancedStyles.welcomeEmoji}>👋</p>
            <p style={enhancedStyles.welcomeTitle}>Hello! I'm AgroBot, your agricultural assistant.</p>
            <p style={enhancedStyles.welcomeText}>Ask me anything about farming, crops, plant diseases, or agricultural practices!</p>
            <p style={enhancedStyles.welcomeText}>
              <span style={enhancedStyles.voiceNote}>
                <span style={enhancedStyles.voiceEmoji}>🎤</span> You can use voice input by clicking the microphone button.
              </span>
            </p>
            <p style={enhancedStyles.welcomeText}>
              <span style={enhancedStyles.voiceNote}>
                <span style={enhancedStyles.voiceEmoji}>🔊</span> Toggle voice output with the speaker button in the header.
              </span>
            </p>
            <p style={enhancedStyles.welcomeText}>
              <span style={enhancedStyles.voiceNote}>
                <span style={enhancedStyles.voiceEmoji}>📷</span> Upload images of your plants for better assistance.
              </span>
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index}>
              {renderMessage(message, index)}
              {message.sender === 'bot' && (
                <div style={enhancedStyles.messageActions}>
                  {voiceEnabled && (
                    <button
                      onClick={() => speakText(message.text)}
                      style={enhancedStyles.speakButton}
                      disabled={isSpeaking}
                      title="Read this message aloud"
                    >
                      🔊
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div style={enhancedStyles.loading}>
            {retryCount > 0 ? (
              <div className="retry-message" style={enhancedStyles.retryMessage}>
                Connecting... Attempt {retryCount}/{MAX_RETRIES}
              </div>
            ) : null}
            <div className="loading-indicator" style={enhancedStyles.loadingIndicator}>
              <div className="chatbot-loading-dot" style={enhancedStyles.loadingDot}></div>
              <div className="chatbot-loading-dot" style={enhancedStyles.loadingDot}></div>
              <div className="chatbot-loading-dot" style={enhancedStyles.loadingDot}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Image preview */}
      {showImagePreview && (
        <div style={enhancedStyles.imagePreviewContainer}>
          <div style={enhancedStyles.imagePreviewHeader}>
            <span>Image Preview</span>
            <button 
              onClick={removeImage} 
              style={enhancedStyles.removeImageButton}
              title="Remove image"
            >
              ✖
            </button>
          </div>
          <div style={enhancedStyles.imagePreview}>
            <img 
              src={getImagePreview()} 
              alt="Preview" 
              style={enhancedStyles.previewImage} 
            />
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={enhancedStyles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Ask about agriculture..."}
          style={{
            ...enhancedStyles.input,
            ...(isListening ? enhancedStyles.listeningInput : {})
          }}
          disabled={isInitializing || isListening}
        />
        
        <div style={enhancedStyles.actionButtons}>
          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            style={enhancedStyles.imageButton}
            disabled={isInitializing || isLoading}
            title="Upload image"
          >
            <span style={enhancedStyles.imageIcon}>
              📷
            </span>
          </button>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          {/* Voice input button */}
          <button
            type="button"
            onClick={toggleListening}
            style={{
              ...enhancedStyles.voiceButton,
              ...(isListening ? enhancedStyles.listeningButton : {}),
            }}
            disabled={isInitializing || !speechRecognition}
            title={speechRecognition ? "Voice input" : "Voice input not supported in this browser"}
          >
            <span style={enhancedStyles.voiceIcon}>
              {isListening ? "⏹️" : "🎙️"}
            </span>
          </button>
          
          {/* Send button */}
          <button 
            type="submit" 
            style={enhancedStyles.button} 
            disabled={isLoading || isInitializing || (!input.trim() && !selectedImage && !isListening)}
          >
            {isInitializing ? "Wait..." : isLoading ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Enhanced inline styles
const enhancedStyles = {
  container: {
    width: '90%',
    maxWidth: '700px',
    height: '80vh', // Using viewport height for better responsiveness
    maxHeight: '700px',
    minHeight: '500px',
    margin: '40px auto',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    position: 'relative', // For proper child positioning
  },
  header: {
    background: 'linear-gradient(135deg, #2c6e49 0%, #1d4e33 100%)',
    padding: '18px 15px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    margin: 0,
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initializing: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '12px',
    marginTop: '5px',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: '20px',
    overflowY: 'auto',
    overflowX: 'hidden',
    background: '#f8f8f8',
    backgroundImage: 'linear-gradient(rgba(44, 110, 73, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 110, 73, 0.05) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(44, 110, 73, 0.3) rgba(0, 0, 0, 0.05)',
    paddingTop: '10px', // Extra padding to prevent messages from touching the header
  },
  welcomeMessage: {
    textAlign: 'center',
    color: '#555',
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    maxWidth: '85%',
    margin: '30px auto',
  },
  welcomeEmoji: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  welcomeTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#2c6e49',
  },
  welcomeText: {
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '8px 0',
  },
  voiceNote: {
    display: 'block',
    marginTop: '15px',
    padding: '8px 12px',
    backgroundColor: 'rgba(44, 110, 73, 0.1)',
    borderRadius: '8px',
    fontWeight: 'bold',
  },
  voiceEmoji: {
    marginRight: '5px',
    fontSize: '16px',
  },
  message: {
    margin: '10px 0',
    padding: '12px 16px',
    borderRadius: '18px',
    maxWidth: '80%',
    wordWrap: 'break-word',
    lineHeight: '1.5',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    display: 'inline-block',
    textAlign: 'left',
    animation: 'fadeIn 0.3s ease-out',
  },
  userMessage: {
    backgroundColor: '#2c6e49',
    color: 'white',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
    borderBottomRightRadius: '5px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: '0',
  },
  botMessage: {
    backgroundColor: 'white',
    color: '#333',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: '5px',
    display: 'block',
    marginRight: 'auto',
    marginLeft: '0',
    borderLeft: '3px solid #2c6e49',
  },
  inputContainer: {
    display: 'flex',
    padding: '15px',
    background: 'white',
    borderTop: '1px solid #eee',
    boxShadow: '0 -1px 5px rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
  },
  input: {
    flexGrow: 1,
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '30px',
    marginRight: '10px',
    outline: 'none',
    fontSize: '15px',
    color: '#333',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  listeningInput: {
    borderColor: '#2c6e49',
    boxShadow: '0 0 0 2px rgba(44, 110, 73, 0.2)',
    background: 'rgba(44, 110, 73, 0.05)',
  },
  button: {
    padding: '12px 25px',
    background: 'linear-gradient(135deg,rgb(193, 225, 209) 0%, #1d4e33 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    minWidth: '80px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    fontSize: '16px',
  },
  voiceButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    padding: '0',
    marginRight: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  listeningButton: {
    backgroundColor: '#2c6e49',
    color: 'white',
    boxShadow: '0 0 0 3px rgba(44, 110, 73, 0.3)',
    animation: 'pulse 1.5s infinite',
  },
  voiceIcon: {
    fontSize: '20px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '15px 0',
    width: '100%',
  },
  loadingIndicator: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 15px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  loadingDot: {
    width: '10px',
    height: '10px',
    margin: '0 5px',
    background: '#2c6e49',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out both',
    animationDelay: (idx) => `${idx * 0.16}s`,
  },
  retryMessage: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
    padding: '5px 10px',
    backgroundColor: 'rgba(255, 224, 199, 0.7)',
    borderRadius: '5px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  // New and enhanced styles for formatted bot responses
  botMessageHeading: {
    color: '#244855',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    marginTop: '8px',
    borderBottom: '1px solid rgba(44, 110, 73, 0.2)',
    paddingBottom: '4px',
  },
  bulletPoint: {
    display: 'flex',
    marginBottom: '6px',
    alignItems: 'flex-start'
  },
  bulletIcon: {
    color: '#2c6e49',
    marginRight: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  numberedItem: {
    display: 'flex',
    marginBottom: '6px',
    alignItems: 'flex-start'
  },
  numberIcon: {
    color: '#2c6e49',
    marginRight: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    minWidth: '20px',
  },
  paragraph: {
    margin: '5px 0',
    lineHeight: '1.5',
  },
  voiceControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '5px',
  },
  voiceToggle: {
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    padding: 0,
    margin: '0 5px',
  },
  voiceEnabled: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
  },
  speakingIndicator: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: '8px',
    animation: 'pulse 1.5s infinite',
  },
  messageActions: {
    display: 'flex',
    justifyContent: 'flex-start',
    margin: '-5px 0 10px 5px',
  },
  speakButton: {
    background: 'transparent',
    border: 'none',
    color: '#2c6e49',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '2px 5px',
    borderRadius: '4px',
    opacity: 0.6,
    transition: 'all 0.2s ease',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
  },
  imageButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    padding: '0',
    marginRight: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  imageIcon: {
    fontSize: '20px',
  },
  imagePreviewContainer: {
    padding: '10px 15px',
    backgroundColor: 'white',
    borderTop: '1px solid #eee',
    borderBottom: '1px solid #eee',
  },
  imagePreviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#666',
  },
  imagePreview: {
    display: 'flex',
    justifyContent: 'center',
    maxHeight: '150px',
    overflow: 'hidden',
    borderRadius: '8px',
  },
  previewImage: {
    maxHeight: '150px',
    maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  removeImageButton: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '2px 5px',
  },
  messageImage: {
    marginTop: '10px',
    maxWidth: '100%',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  uploadedImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
  },
};

export default Chatbot; 