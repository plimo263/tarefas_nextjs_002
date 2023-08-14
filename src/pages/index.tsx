import Head from 'next/head'
import Image from 'next/image';
import styles from '@/styles/Home.module.css'
import HeroImg from '../../public/assets/hero.png';
import { GetStaticProps } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase_config';

interface HomeProps {
  posts: number,
  comments: number,

}

export default function Home({ posts, comments}: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image 
            className={styles.hero}
            alt="Logo tarefas+"
            src={HeroImg}
            priority
          />
        </div>
          <h1 className={styles.title}>
            Sistema feito para você organizar <br/> seus estudos e tarefas
          </h1>
          <div className={styles.infoContent}>
            <section className={styles.box}>
              <span>+ {posts} posts</span>
            </section>
            <section className={styles.box}>
              <span>+ {comments} comentarios</span>
            </section>
          </div>
      </main>
    </div>
  )
}

// Gera o HTML estatico, uma unica vez, a nao ser que você configure a revalidacao.
export const getStaticProps: GetStaticProps = async ()=>{

  // Buscar do banco os numeros e mandar ao components
  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tarefas");


  const snapShotComment = await getDocs(commentRef);
  const snapShotTask = await getDocs(postRef);
  
  return {
    props: {
      posts: snapShotTask.size || 0,
      comments: snapShotComment.size || 0,
    },
    revalidate: 60, // Revalidado a cada 60 segundos.
  }

}