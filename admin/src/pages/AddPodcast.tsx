import React, { useState } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import axios from 'axios';

const CLOUDINARY_UPLOAD_PRESET = 'unsigned-podcast';
const CLOUDINARY_CLOUD_NAME = 'dldtb68nn';

const handleUploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    formData
  );
  return res.data.secure_url;
};

export default function AddPodcast({ onPodcastAdded }: { onPodcastAdded?: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [authorPhoto, setAuthorPhoto] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!audio) throw new Error('Veuillez sélectionner un fichier audio.');
      let audioUrl = '';
      let authorPhotoUrl = '';
      // Upload audio sur Cloudinary
      audioUrl = await handleUploadToCloudinary(audio);
      // Upload author photo si fournie
      if (authorPhoto) {
        authorPhotoUrl = await handleUploadToCloudinary(authorPhoto);
      }
      // Ajout du podcast dans Firestore
      await addDoc(collection(db, 'podcasts'), {
        title,
        description,
        audioUrl,
        author,
        authorPhotoUrl,
        publishedAt: Timestamp.now(),
      });
      setTitle('');
      setDescription('');
      setAuthor('');
      setAuthorPhoto(null);
      setAudio(null);
      if (onPodcastAdded) onPodcastAdded();
      alert('Podcast ajouté !');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: 'auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <h2>Ajouter un podcast</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Titre</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Nom de l'auteur</label>
        <input type="text" value={author} onChange={e => setAuthor(e.target.value)} required style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Photo de l'auteur</label>
        <input type="file" accept="image/*" onChange={e => setAuthorPhoto(e.target.files?.[0] || null)} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Fichier audio</label>
        <input type="file" accept="audio/*" onChange={e => setAudio(e.target.files?.[0] || null)} required />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ padding: 10, width: '100%' }}>
        {loading ? 'Ajout en cours...' : 'Ajouter'}
      </button>
    </form>
  );
}
