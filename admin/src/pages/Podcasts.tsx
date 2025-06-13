import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import AddPodcast from './AddPodcast';

interface Podcast {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  author: string;
  authorPhotoUrl?: string;
  publishedAt: any;
}

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editPodcast, setEditPodcast] = useState<Podcast | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAuthor, setEditAuthor] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'podcasts'), orderBy('publishedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPodcasts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Podcast)));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer ce podcast ?')) {
      await deleteDoc(doc(db, 'podcasts', id));
    }
  };

  const handleEdit = (podcast: Podcast) => {
    setEditPodcast(podcast);
    setEditTitle(podcast.title);
    setEditDescription(podcast.description);
    setEditAuthor(podcast.author);
  };

  const handleUpdate = async () => {
    if (!editPodcast) return;
    await updateDoc(doc(db, 'podcasts', editPodcast.id), {
      title: editTitle,
      description: editDescription,
      author: editAuthor,
    });
    setEditPodcast(null);
  };

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-8">
        <h1>Gestion des Podcasts</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          <i className="fas fa-plus"></i> Nouveau Podcast
        </button>
      </div>

      <div className="card mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2>Statistiques</h2>
          <select className="form-control" style={{ width: 'auto' }}>
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>Cette année</option>
          </select>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="card">
            <h3 className="text-gray-600">Total Écoutes</h3>
            <p className="text-2xl font-bold">1,234</p>
          </div>
          <div className="card">
            <h3 className="text-gray-600">Temps moyen d'écoute</h3>
            <p className="text-2xl font-bold">15:30</p>
          </div>
          <div className="card">
            <h3 className="text-gray-600">Podcasts Publiés</h3>
            <p className="text-2xl font-bold">{podcasts.length}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Description</th>
                <th>Auteur</th>
                <th>Photo</th>
                <th>Date</th>
                <th>Audio</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {podcasts.map(podcast => (
                <tr key={podcast.id}>
                  <td><strong>{podcast.title}</strong></td>
                  <td>{podcast.description}</td>
                  <td>{podcast.author}</td>
                  <td>{podcast.authorPhotoUrl ? <img src={podcast.authorPhotoUrl} alt="Auteur" style={{ width: 40, height: 40, borderRadius: '50%' }} /> : '-'}</td>
                  <td>{podcast.publishedAt?.toDate ? podcast.publishedAt.toDate().toLocaleDateString() : '-'}</td>
                  <td>{podcast.audioUrl ? <audio controls src={podcast.audioUrl} style={{ width: 120 }} /> : '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-icon" title="Éditer" onClick={() => handleEdit(podcast)} style={{ minWidth: 90 }}>
                        <i className="fas fa-edit"></i> Éditer
                      </button>
                      <button className="btn btn-icon" title="Supprimer" onClick={() => handleDelete(podcast.id)} style={{ minWidth: 110, background: '#ff4d4f', color: '#fff' }}>
                        <i className="fas fa-trash"></i> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="flex justify-between items-center mb-4">
              <h2>Nouveau Podcast</h2>
              <button 
                className="btn btn-icon"
                onClick={() => setShowUploadModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <AddPodcast onPodcastAdded={() => setShowUploadModal(false)} />
          </div>
        </div>
      )}

      {editPodcast && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2>Modifier le podcast</h2>
            <div style={{ marginBottom: 12 }}>
              <label>Titre</label>
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Description</label>
              <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Auteur</label>
              <input type="text" value={editAuthor} onChange={e => setEditAuthor(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => setEditPodcast(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
