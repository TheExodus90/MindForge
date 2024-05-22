import React from 'react';
import styles from 'pages/index.module.css';
import Footer from 'components/footer'; // Import the Footer component

const Blog = () => {
  // Sample blog post data
  const blogPosts = [
    {
      id: 1,
      title: 'Introducing Mind Forge: Your Ultimate AI Companion',
      author: 'ExoFi Labs Team',
      date: 'May 1, 2024',
      content: `
        <h2>Introducing Mind Forge: Your Ultimate AI Companion</h2>
        <p>Welcome to Mind Forge, the latest innovation from ExoFi Labs that's set to revolutionize the way you interact with AI. Mind Forge is more than just a chatbot—it's your ultimate AI companion, designed to assist you in various tasks, provide insightful conversations, and even engage in creative endeavors.</p>
        <h3>What is Mind Forge?</h3>
        <p>Mind Forge is a cutting-edge digital platform powered by ChatGPT, offering seamless integration of advanced AI communication with rapid voice synthesis capabilities from 11Labs and Google TTS. It's a dynamic and responsive experience that brings together the latest advancements in artificial intelligence to create an unparalleled user experience.</p>
        <h3>Key Features</h3>
        <ol>
          <li>Personalized Conversations: Mind Forge offers a range of AI personalities to chat with, each tailored to suit your preferences and needs.</li>
          <li>Rapid Voice Synthesis: With Mind Forge, you can turn text into speech in an instant.</li>
          <li>Advanced AI Capabilities: Powered by ChatGPT, Mind Forge is equipped with advanced AI capabilities.</li>
          <li>Image Generation with DALL-E-3: Experience the future of image generation with DALL-E-3 integration.</li>
        </ol>
        <h3>How Does It Work?</h3>
        <p>Using Mind Forge is simple. Just select an AI personality to chat with, type your message, and watch as Mind Forge responds with insightful, engaging, and sometimes even humorous responses.</p>
        <h3>Get Started Today!</h3>
        <p>Ready to experience the future of AI communication? Sign up for Mind Forge today and embark on a journey of discovery, creativity, and endless possibilities. Join ExoFi Labs in shaping the future of artificial intelligence with Mind Forge. <a href="/usersignup">Sign up</a> today!</p>
      `,
    },
  ];

  return (
    <div>
      <div className={styles.blogContainer}>
        {blogPosts.map((post) => (
          <div key={post.id} className={styles.blogPost}>
            <div className={styles['text-container']}>
              <h2>{post.title}</h2>
              <p>
                <strong>Author:</strong> {post.author} | <strong>Date:</strong> {post.date}
              </p>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
              
            </div>
            <Footer /> {/* Add the Footer component here */}
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default Blog;
