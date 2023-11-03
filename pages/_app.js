// _app.js
import styles from "./index.module.css";
import '../styles/globals.css';
import { AuthProvider } from '../context/authContext'; // Import the AuthProvider

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider> {/* Wrap the entire application with the AuthProvider */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
