import React, { useState } from 'react';
import firebase from 'firebase';
import { db, storage } from '../../firebase';
import LinearProgress from '@material-ui/core/LinearProgress';
import './CreatePost.css';

const CreatePost = () => {
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState('');
    const [username, setUsername] = useState('wendell');

    const handleImageChange = (event) =>{
        setImage(event.target.files[0]);
    }

    const handleUpload = (e) => {
        e.preventDefault();
        const uploadTask = storage.ref(`images/${image.name}`).put(image);

        //Track image upload progress
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                let progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(progress)
            },
            (error) =>{
                console.log(error)
            },
            () => {
                storage
                .ref('images')
                .child(image.name)
                .getDownloadURL()
                .then(res =>{
                    db.collection('posts').add({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        caption: caption,
                        username: username,
                        imageURL: res
                    });
                    setImage(null);
                    setCaption('');
                    setProgress(0);
                })
            }
        )

    }

    const truncateText = (text, num) =>{
        return (text?.length >num? text.slice(0, num) + '...' : text) 
    }

    return (
        <div className='createpost'>
            <form className='createpost__form' onSubmit={handleUpload}>
                <textarea type='text' value={caption} placeholder='Caption...' onChange={(e) => setCaption(e.target.value)} />
                <LinearProgress variant='determinate' value={progress} />
                <div className='form__controls'>
                    <label className='form__controls__label'>
                        <input type='file' onChange={handleImageChange}/>
                        Upload a photo
                    </label>
                    <div className='form__controls__filename'>
                        <span>{truncateText(image?.name, 20)}</span>
                    </div>
                    <button type='submit'>Post</button>
                </div>
            </form>
        </div>
    )
}

export default CreatePost;