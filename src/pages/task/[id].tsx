import Head from "next/head";
import  styles from './styles.module.css';
import { GetServerSideProps } from "next";
import { db  } from '../../services/firebase_config';
import { doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { TextArea } from "@/components/textarea";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { FaTrash } from 'react-icons/fa';

interface TaskProps {
    item: {
        tarefa: string,
        created: string,
        public: boolean,
        taskId: string,
        user: string,
    },
    allComments: CommentProps[],
}

interface CommentProps {
    id: string,
    user: string,
    comment: string,
    taskId: string,
    name: string,
}

export default function Task({ item, allComments }: TaskProps){
    const [input, setInput] = useState('');
    const [comments, setComments] = useState<CommentProps[]>(allComments);
    const { data: session } = useSession();

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>)=>{
        setInput(e.target.value);
    }
    //
    const handleComment = async (e: FormEvent)=>{
        e.preventDefault();
        if(input === "") return;
        if(!session?.user?.email || !session?.user?.email){
            return ;
        }
        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item.taskId,
                created: new Date(),
            });

            setComments([
                {
                    comment: input,
                    user: session?.user?.email,
                    name: session?.user?.name as string,
                    taskId: item.taskId,
                    id: docRef.id,
                },
                ...comments,
            ])

            setInput("");
            
        } catch (error) {
            console.log(error);
        }
    }
    //
    const handleDeleteComment =async (id: string) => {
        try {
            const docRef = doc(db, "comments", id);
            await deleteDoc(docRef);

            setComments(comments.filter(item=> item.id !== id));

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>
            <section className={styles.commentsContainer}>
                <h2>Deixar comentario</h2>
                <form onSubmit={handleComment}>
                    <TextArea 
                        placeholder="Digite seu comentario..."
                        value={input}
                        onChange={handleChange}
                    />
                    <button disabled={!session?.user} className={styles.button}>
                        Enviar Comentario
                    </button>
                </form>
            </section>
            <section className={styles.commentsContainer}>
                <h2>Todos os comentarios</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentário foi encontrado</span>
                )}

                {comments.map((item)=>(
                    <article key={item.id} className={styles.comment}>
                        <div className={styles.headComment}>
                            <label className={styles.commentsLabel}>{item.name}</label>
                            {session?.user?.email === item.user && (
                            <button className={styles.buttonTrash} onClick={()=> handleDeleteComment(item.id)}>
                                <FaTrash size={18} color="#ea3140" />
                            </button>
                            )}
                        </div>
                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    )
}
//
export const getServerSideProps: GetServerSideProps = async ({ params })=>{

    const id = params?.id as string;
    const docRef = doc(db, "tarefas", id);

    const q = query(collection(db, "comments"), where("taskId", "==", id));
    const snapshotComments = await getDocs(q);

    const  allComments: CommentProps[] = [];

    snapshotComments.forEach((doc)=>{
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,
        });
    });

    const snapshot = await getDoc(docRef);

    if(snapshot.data === undefined || !snapshot.data()?.public){
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;
    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    return {
        props: {
            item: task,
            allComments,
        }
    }

}