import React, { useState } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import axios from 'axios';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME } from '../config/cloudinaryConfig';

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

export default function AddPrayer({ onPrayerAdded }: { onPrayerAdded?: () => void }) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [audio, setAudio] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrlPreview, setAudioUrlPreview] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Handle file input and preview
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAudio(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrlPreview(url);
      setAudioCurrentTime(0);
      setAudioDuration(0);
    } else {
      setAudioUrlPreview(null);
      setAudioCurrentTime(0);
      setAudioDuration(0);
    }
  };

  // Format time mm:ss
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let audioUrl = '';
      if (audio) {
        audioUrl = await handleUploadToCloudinary(audio);
      }
      await addDoc(collection(db, 'prayers'), {
        author,
        content,
        audioUrl,
        amens: 0,
        likes: 0,
        commentsList: [],
        published: true,
        archived: false,
        created_at: new Date().toISOString(),
        publishedAt: Timestamp.now(),
        adminOnly: false,
      });
      setAuthor('');
      setContent('');
      setAudio(null);
      if (onPrayerAdded) onPrayerAdded();
      alert('Prière ajoutée !');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: 'auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <h2>Ajouter une prière</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Nom de l'auteur</label>
        <input type="text" value={author} onChange={e => setAuthor(e.target.value)} required style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Intention de prière</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} required style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Fichier audio (optionnel)</label>
        <input type="file" accept="audio/*" onChange={handleAudioChange} />
        {audioUrlPreview && (
          <div style={{ marginTop: 8 }}>
            <audio
              ref={audioRef}
              src={audioUrlPreview}
              controls
              style={{ width: '100%' }}
              onLoadedMetadata={e => setAudioDuration(e.currentTarget.duration)}
              onTimeUpdate={e => setAudioCurrentTime(e.currentTarget.currentTime)}
            />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 12 }}>{formatTime(audioCurrentTime)}</span>
              <input
                type="range"
                min={0}
                max={audioDuration || 0}
                step={0.01}
                value={audioCurrentTime}
                onChange={e => {
                  const time = Number(e.target.value);
                  setAudioCurrentTime(time);
                  if (audioRef.current) audioRef.current.currentTime = time;
                }}
                style={{ flex: 1, margin: '0 8px' }}
                disabled={!audioDuration}
              />
              <span style={{ fontSize: 12 }}>{formatTime(audioDuration)}</span>
            </div>
          </div>
        )}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ padding: 10, width: '100%' }}>
        {loading ? 'Ajout en cours...' : 'Ajouter'}
      </button>
    </form>
  );
}
