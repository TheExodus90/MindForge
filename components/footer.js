import Link from 'next/link';
import styles from '../pages/index.module.css';// Assuming you have a CSS module for styling

function Footer() {
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
                </div>
                <div className={styles.copyRight}>
                    <p>© {new Date().getFullYear()} ExoFi Labs. Made by ExoFi. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
