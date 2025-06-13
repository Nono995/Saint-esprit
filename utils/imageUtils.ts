import * as ImagePicker from 'expo-image-picker';

export const pickImage = async (): Promise<string | null> => {
  try {
    // Demander la permission d'accéder à la galerie
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin des permissions pour accéder à vos photos !');
      return null;
    }

    // Lancer le sélecteur d'images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la sélection de l\'image:', error);
    return null;
  }
};

export const uploadImage = async (uri: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    
    // Créer un objet blob à partir de l'URI de l'image
    const localUri = uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image';
    
    formData.append('file', {
      uri: localUri,
      name: filename,
      type,
    } as any);
      formData.append('upload_preset', 'unsigned-podcast');

    // Envoyer l'image à Cloudinary
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dldtb68nn/image/upload',
      {
        method: 'POST',
        body: formData,
        headers: {
          'content-type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    return null;
  }
};
