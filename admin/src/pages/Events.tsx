import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { Event } from '../types';
import { collection, getDocs, orderBy, query, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import ImageUpload from '../components/ImageUpload';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME } from '../config/cloudinaryConfig';
import '../styles/Events.css';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(eventsList);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      setMessage('Erreur lors du chargement des événements.');
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      let imageUrl = '';
        if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
        imageUrl = data.secure_url;
      }

      await addDoc(collection(db, 'events'), {
        title,
        description,
        date,
        time,
        location,
        image_url: imageUrl,
        created_at: Timestamp.now(),
      });

      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setSelectedFile(null);
      setPreviewUrl('');
      setMessage('Événement ajouté avec succès !');
      fetchEvents();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'événement:', error);
      setMessage('Erreur lors de l\'ajout de l\'événement.');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (event: Event) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet événement ?')) return;

    try {
      // Supprimer l'image de Cloudinary si elle existe
      if (event.image_url) {
        const publicId = event.image_url.split('/').pop()?.split('.')[0];
        if (publicId) {        const formData = new FormData();
          formData.append('public_id', publicId);
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

          await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/delete_by_token`, {
            method: 'POST',
            body: formData
          });
        }
      }

      // Supprimer l'événement de Firestore
      await deleteDoc(doc(db, 'events', event.id));
      setMessage('Événement supprimé.');
      fetchEvents();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage('Erreur lors de la suppression de l\'événement.');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 800, margin: '0 auto', marginBottom: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Ajouter un événement</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Titre</label>
            <input
              className="form-control"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label className="form-label">Heure</label>
                <input
                  type="time"
                  className="form-control"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lieu</label>
            <input
              className="form-control"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image de l'événement</label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              previewUrl={previewUrl}
            />
          </div>

          <div className="form-group" style={{ textAlign: 'right' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Ajouter l\'événement'}
            </button>
          </div>
        </form>

        {message && (
          <div style={{ color: message.includes('Erreur') ? '#dc3545' : '#10b981', textAlign: 'center', marginTop: 12 }}>
            {message}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 16 }}>Liste des événements</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loader" style={{ margin: '0 auto' }}></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Lieu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td>
                      {event.image_url && (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                      )}
                    </td>
                    <td>{event.title}</td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>{event.time}</td>
                    <td>{event.location}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(event)}
                        className="btn btn-danger btn-sm"
                        title="Supprimer"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
