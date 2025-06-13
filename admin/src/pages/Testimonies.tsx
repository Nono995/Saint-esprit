import React, { useState, useEffect } from 'react';
import { Testimony } from '../types';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query, Timestamp } from 'firebase/firestore';

export default function Testimonies() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTestimonies = async () => {
      const q = query(collection(db, 'testimonies'), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      setTestimonies(snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          author: data.author || '',
          content: data.content || '',
          created_at: data.created_at,
          publishedAt: data.publishedAt,
          published: data.published,
          archived: data.archived,
          likes: data.likes ?? 0,
        };
      }));
      setLoading(false);
    };
    fetchTestimonies();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !content) return;
    await addDoc(collection(db, 'testimonies'), {
      author,
      content,
      published: false,
      archived: false,
      created_at: new Date().toISOString(),
      publishedAt: Timestamp.now(),
      likes: 0,
    });
    setAuthor('');
    setContent('');
    setMessage('Témoignage ajouté !');
    setTimeout(() => setMessage(''), 2000);
    // Refresh
    const q = query(collection(db, 'testimonies'), orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);
    setTestimonies(snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        author: data.author || '',
        content: data.content || '',
        created_at: data.created_at,
        publishedAt: data.publishedAt,
        published: data.published,
        archived: data.archived,
        likes: data.likes ?? 0,
      };
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce témoignage ?')) {
      await deleteDoc(doc(db, 'testimonies', id));
      setTestimonies(testimonies.filter(t => t.id !== id));
      setMessage('Témoignage supprimé.');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    await updateDoc(doc(db, 'testimonies', id), { published: !published });
    setTestimonies(testimonies.map(t => t.id === id ? { ...t, published: !published } : t));
    setMessage(!published ? 'Témoignage publié !' : 'Témoignage dépublié.');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleArchive = async (id: string) => {
    await updateDoc(doc(db, 'testimonies', id), { archived: true });
    setTestimonies(testimonies.map(t => t.id === id ? { ...t, archived: true } : t));
    setMessage('Témoignage archivé.');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', marginBottom: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Ajouter un témoignage</h2>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Auteur</label>
            <input
              className="form-control"
              placeholder="Nom de l'auteur"
              value={author}
              onChange={e => setAuthor(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Témoignage</label>
            <textarea
              className="form-control"
              placeholder="Votre témoignage..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
            />
          </div>
          <div className="form-group" style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">
              Ajouter
            </button>
          </div>
        </form>
        {message && <div style={{ color: '#10b981', textAlign: 'center', marginTop: 12 }}>{message}</div>}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 16 }}>Liste des témoignages</h2>
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
                  <th>Témoignage</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonies.filter(t => !t.archived).map(t => (
                  <tr key={t.id}>
                    <td>{t.author}</td>
                    <td style={{ maxWidth: 320 }}>{t.content}</td>
                    <td>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</td>
                    <td>
                      {t.published ? (
                        <span className="badge badge-success">Publié</span>
                      ) : (
                        <span className="badge badge-warning">Non publié</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePublish(t.id, !!t.published)}
                          className="btn btn-primary btn-icon"
                          title={t.published ? 'Dépublier' : 'Publier'}
                        >
                          {t.published ? 'Dépublier' : 'Publier'}
                        </button>
                        <button
                          onClick={() => handleArchive(t.id)}
                          className="btn btn-icon"
                          title="Archiver"
                          style={{ background: '#e5e7eb', color: '#374151' }}
                        >
                          Archiver
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
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
        <h2 style={{ marginBottom: 16 }}>Témoignages archivés</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Auteur</th>
                <th>Témoignage</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {testimonies.filter(t => t.archived).map(t => (
                <tr key={t.id}>
                  <td>{t.author}</td>
                  <td style={{ maxWidth: 320 }}>{t.content}</td>
                  <td>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</td>
                  <td>
                    {t.published ? (
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
    </div>
  );
}