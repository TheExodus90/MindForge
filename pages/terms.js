import React from 'react';
import styles from "./index.module.css";
import Footer from 'components/footer'; // Import the Footer component

const TermsOfService = () => {
  return (
    <div className={styles.body}>
      <h1>Terms of Service</h1>
      <h2>1. Acceptance of Terms</h2>
      <p>
        - By accessing or using our services, you agree to these Terms of Service and any additional terms that may apply.
      </p>

      <h2>2. Use of Services</h2>
      <p>
        - You may use our services only for lawful purposes. You must not use our services to engage in any illegal or prohibited activities.
      </p>

      <h2>3. Intellectual Property</h2>
      <p>
        - All content, trademarks, and intellectual property on our platform are owned by us. You may not use, reproduce, or distribute our content without our permission.
      </p>

      <h2>4. Limitation of Liability</h2>
      <p>
        - We are not liable for any damages, direct or indirect, resulting from your use of our services.
      </p>

      <h2>5. Changes to Terms</h2>
      <p>
        - We may update these Terms of Service to reflect changes in our services or for legal and compliance requirements. Your continued use of our services indicates your acceptance of these changes.
      </p>

      <h2>6. Termination of Services</h2>
      <p>
        - We may terminate or suspend your access to our services at our discretion, without prior notice, for violations of these Terms of Service or in breach of local laws.
      </p>

           <Footer /> {/* Add the Footer component here */}
    </div>
  );
};

export default TermsOfService;
