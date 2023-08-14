import styles from '@/pages/dashboard/styles.module.css';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getSession } from 'next-auth/react';
import { TextArea } from '@/components/textarea';
import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { db } from '../../services/firebase_config';
import { doc, deleteDoc, query, orderBy, where, onSnapshot, addDoc, collection } from 'firebase/firestore';
import Link from 'next/link';

interface HomeProps {
    user: {
        email: string
    }
}

interface TaskProps {
    id: string,
    created: Date,
    public: boolean,
    tarefa: string,
    user: string,
}

export default function Dashboard({ user }: HomeProps ){

    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TaskProps[]>([]);

    useEffect(()=>{
        (async() =>{
            const tarefasRef = collection(db, "tarefas");
            const q = query(tarefasRef, orderBy("created", "desc"), 
            where("user", "==", user?.email),
        );

        onSnapshot(q, snapshot=>{
            let lista = [] as TaskProps[];
            snapshot.forEach((doc)=>{
                lista.push({
                    id: doc.id,
                    tarefa: doc.data().tarefa,
                    created: doc.data().created,
                    user: doc.data().user,
                    public: doc.data().public
                });
            });
            setTasks(lista);
        })
        })();

    }, [user?.email]);

    const handleChangePublic = (event: ChangeEvent<HTMLInputElement>)=> {
        setPublicTask(event.target.checked);
    };
    //
    const handleSubmit = async (event: FormEvent)=>{
        event.preventDefault();
        if(!input){
            return false;
        }
        // Cadastrando tarefas no banco
        try {
            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask
            });

            setInput("");
            setPublicTask(false);

        } catch (error) {
            console.log(error);
        }
    }
    //
    const handleShare = async (id: string)=>{
        console.log(id);

        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        );
    }

    const handleDeleteTask =async (id:string) => {
        const docRef = doc(db, "tarefas", id);
        await deleteDoc(docRef);
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa.</h1>
                        <form onSubmit={handleSubmit}>
                            <TextArea 
                                placeholder='Digite qual a sua  tarefa'
                                value={input}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>)=> setInput(event.target.value)}
                                
                            />
                            <div className={styles.checkboxArea}>
                                <input onChange={handleChangePublic} 
                                    checked={publicTask} 
                                    type="checkbox" 
                                    className={styles.checkbox}
                                />
                                <label>Deixar tarefa publica</label>
                            </div>
                            <button type='submit' className={styles.button}>
                                REGISTRAR
                            </button>

                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>
                    {tasks.map((task)=>(
                        <article key={task.id} className={styles.task}>
                            {task.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>
                                        Publica
                                    </label>
                                    <button className={styles.shareButton} onClick={()=> handleShare(task.id)}>
                                        <FiShare2 
                                            size={23}
                                            color="#3183ff"
                                            />
                                    </button>
                                </div>
                            )}
                        <div className={styles.taskContent}>
                            {task.public ? (
                            <Link href={`/task/${task.id}`}>
                            <p>{task.tarefa}</p>
                            </Link> ) : (
                            <p>
                               {task.tarefa}
                            </p>
                            )}
                            <button className={styles.trashButton} onClick={()=> handleDeleteTask(task.id)}>
                                <FaTrash 
                                    size={24}
                                    color="ea3140"
                                />

                            </button>
                        </div>

                    </article>

                    ))}
                    
                </section>

            </main>
        </div>
    )
}

// Funciona como o useEffect mas do lado do servidor
export const getServerSideProps: GetServerSideProps =async ({ req }) => {
    const session = await getSession({ req }); // Repassando ao getSession para obtera se sessao
    //console.log(session);
    if(!session?.user){
        // Se nao tem usuario vamos redirecionar para a home
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }
    return {
        props: {
            user: {
                email: session?.user?.email,
            }
        }
    }
}