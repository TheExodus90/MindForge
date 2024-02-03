import Link from 'next/link';
import styles from '../pages/index.module.css';

function Footer() {
    const supportEmail = 'support@exofi.io';

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.links}>
                    <Link href="/privacy">
                        Privacy Policy
                    </Link>
                    <Link href="/terms">
                        Terms of Service
                    </Link>
                    <a href={`mailto:${supportEmail}`}>
                        Contact
                    </a>
                    <a href="https://twitter.com/ExofiLabs" target="_blank" rel="noopener noreferrer">
                        X
                    </a>
                </div>
                <div className={styles.copyRight}>
                    <p>© {new Date().getFullYear()} ExoFi Labs. Made by ExoFi. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
