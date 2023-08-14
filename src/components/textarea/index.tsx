import styles from '@/components/textarea/styles.module.css';
import { HTMLProps } from 'react';

export function TextArea({ ...rest }: HTMLProps<HTMLTextAreaElement>){

    return (
        <textarea className={styles.textarea} {...rest}></textarea>

    )
};