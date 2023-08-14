import styles from './styles.module.css';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export function Header(){

    const { data: session, status } = useSession();

    return (
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.logo}>
                    <h1>
                        Tarefas
                        <span>+</span>

                    </h1>                    
                    </Link>
                    { session?.user && (
                    <Link href="/dashboard" className={styles.link}>
                        Meu Painel
                    </Link>
                    )}
                </nav>
                {status === "loading" ? (
                    <>
                    
                    </>
                ) : session ? (
                    <button onClick={()=> signOut() } className={styles.button}>
                    Olá {session?.user?.name}
                </button>
                ) : (
                    <button onClick={()=> signIn("google")} className={styles.button}>
                    Acessar
                </button>

                )}
                
            </section>
        </header>
    )
}