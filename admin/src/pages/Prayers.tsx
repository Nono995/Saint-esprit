import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { Prayer } from '../types';
import { collection, getDocs, orderBy, query, updateDoc, doc, addDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME } from '../config/cloudinaryConfig';
import AddPrayer from './AddPrayer';

export default function Prayers() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPrayers = async () => {
      const q = query(collection(db, 'prayers'), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      setPrayers(snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          author: data.author || '',
          content: data.content || '',
          audioUrl: data.audioUrl || '',
          duration: data.duration || 0,
          date: data.date || data.created_at || '',
          likes: data.likes ?? 0,
          amens: data.amens ?? 0,
          published: data.published ?? false,
          adminOnly: data.adminOnly ?? false,
          archived: data.archived ?? false,
          commentsList: data.commentsList || [],
        };
      }));
      setLoading(false);
    };
    fetchPrayers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setMessage('');
    if (!author.trim() || !content.trim()) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    let audioUrl = '';
    try {
      if (audioFile) {
        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: formData }
        );
        if (!response.ok) throw new Error('Erreur réseau lors de l\'upload audio');
        const data = await response.json();
        if (!data.secure_url) throw new Error('Erreur lors de l\'upload audio');
        audioUrl = data.secure_url;
      }
      await addDoc(collection(db, 'prayers'), {
        author,
        content,
        audioUrl: audioUrl || '',
        duration: 0, // ou la vraie durée si audio
        date: new Date().toISOString(),
        amens: 0,
        likes: 0,
        published: true,
        adminOnly: false,
        archived: false,
        commentsList: [],
        publishedAt: Timestamp.now(),
      });
      setAuthor('');
      setContent('');
      setAudioFile(null);
      setMessage('Prière ajoutée !');
      setTimeout(() => setMessage(''), 2000);
      // Refresh
      const q = query(collection(db, 'prayers'), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      setPrayers(snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          author: data.author || '',
          content: data.content || '',
          audioUrl: data.audioUrl || '',
          duration: data.duration || 0,
          date: data.date || data.created_at || '',
          likes: data.likes ?? 0,
          amens: data.amens ?? 0,
          published: data.published ?? false,
          adminOnly: data.adminOnly ?? false,
          archived: data.archived ?? false,
          commentsList: data.commentsList || [],
        };
      }));
    } catch (err: any) {
      setFormError(err?.message || 'Erreur lors de l\'ajout de la prière.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette prière ?')) {
      const prayerRef = doc(db, 'prayers', id);
      await deleteDoc(prayerRef);
      setPrayers(prayers => prayers.filter(p => p.id !== id));
      setMessage('Prière supprimée.');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    await updateDoc(doc(db, 'prayers', id), { published: !published });
    setPrayers(prayers => prayers.map(p => p.id === id ? { ...p, published: !published } : p));
    setMessage(!published ? 'Prière publiée !' : 'Prière dépubliée.');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleArchive = async (id: string) => {
    await updateDoc(doc(db, 'prayers', id), { archived: true });
    setPrayers(prayers => prayers.map(p => p.id === id ? { ...p, archived: true } : p));
    setMessage('Prière archivée.');
    setTimeout(() => setMessage(''), 2000);
  };

  // Affichage des commentaires d'une prière
  const handleShowComments = (prayer: Prayer) => {
    setSelectedPrayer(prayer);
    setShowComments(true);
  };
  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedPrayer(null);
  };

  const handleDeleteComment = async (commentIdx: number) => {
    if (!selectedPrayer) return;
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    
    const newComments = [...selectedPrayer.commentsList || []];
    newComments.splice(commentIdx, 1);
    
    await updateDoc(doc(db, 'prayers', selectedPrayer.id), {
      commentsList: newComments
    });
    
    setSelectedPrayer({ ...selectedPrayer, commentsList: newComments });
    setPrayers(prayers => prayers.map(p => 
      p.id === selectedPrayer.id ? { ...p, commentsList: newComments } : p
    ));
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', marginBottom: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Ajouter une prière</h2>
        <AddPrayer onPrayerAdded={() => window.location.reload()} />
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 16 }}>Liste des prières</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loader" style={{ margin: '0 auto' }}></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Auteur</th>
                  <th>Intention</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Amens</th>
                  <th>Commentaires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prayers.filter(p => !p.archived).map(p => (
                  <tr key={p.id}>
                    <td>{p.author}</td>
                    <td style={{ maxWidth: 320 }}>{p.content}</td>
                    <td>{p.date ? new Date(p.date).toLocaleDateString() : ''}</td>
                    <td>
                      {p.published ? (
                        <span className="badge badge-success">Publié</span>
                      ) : (
                        <span className="badge badge-warning">Non publié</span>
                      )}
                    </td>
                    <td>{p.amens ?? 0}</td>
                    <td>
                      <button className="btn btn-secondary btn-icon" onClick={() => handleShowComments(p)}>
                        Voir ({p.commentsList?.length ?? 0})
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePublish(p.id, !!p.published)}
                          className="btn btn-primary btn-icon"
                          title={p.published ? 'Dépublier' : 'Publier'}
                        >
                          {p.published ? 'Dépublier' : 'Publier'}
                        </button>
                        <button
                          onClick={() => handleArchive(p.id)}
                          className="btn btn-icon"
                          title="Archiver"
                          style={{ background: '#e5e7eb', color: '#374151' }}
                        >
                          Archiver
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="btn btn-danger btn-icon"
                          title="Supprimer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card" style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Prières archivées</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Auteur</th>
                <th>Intention</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {prayers.filter(p => p.archived).map(p => (
                <tr key={p.id}>
                  <td>{p.author}</td>
                  <td style={{ maxWidth: 320 }}>{p.content}</td>
                  <td>{p.date ? new Date(p.date).toLocaleDateString() : ''}</td>
                  <td>
                    {p.published ? (
                      <span className="badge badge-success">Publié</span>
                    ) : (
                      <span className="badge badge-warning">Non publié</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'affichage des commentaires */}
      {showComments && selectedPrayer && (
        <div className="modal" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog" style={{ maxWidth: 500, margin: '5% auto', background: '#fff', borderRadius: 8, padding: 24 }}>
            <h3>Commentaires pour la prière de {selectedPrayer.author}</h3>
            <ul style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
              {selectedPrayer.commentsList?.length === 0 ? (
                <li style={{ color: '#888' }}>Aucun commentaire</li>
              ) : null}
              {selectedPrayer.commentsList && selectedPrayer.commentsList.length > 0 && selectedPrayer.commentsList.map((c, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{c.text}</span>
                  <br />
                  <span style={{ color: '#888', fontSize: 12 }}>{c.date ? new Date(c.date).toLocaleString() : ''}</span>
                  <button className="btn btn-danger btn-xs" style={{ marginLeft: 8 }} onClick={() => handleDeleteComment(i)}>Supprimer</button>
                </li>
              ))}
            </ul>
            <button className="btn" onClick={handleCloseComments}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}