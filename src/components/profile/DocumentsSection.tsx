import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../../constants';

interface Document {
  id: string;
  name: string;
  type: string;
  uri: string;
  size: number;
}

interface DocumentsSectionProps {
  documents: Document[];
  onAddDocument: (document: Document) => void;
  onRemoveDocument: (id: string) => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  onAddDocument,
  onRemoveDocument,
}) => {
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        onAddDocument({
          id: Date.now().toString(),
          name: result.assets[0].name,
          type: result.assets[0].mimeType || '',
          uri: result.assets[0].uri,
          size: result.assets[0].size || 0,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Документы</Text>

      <ScrollView style={styles.documentsList}>
        {documents.map((doc) => (
          <View key={doc.id} style={styles.documentItem}>
            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{doc.name}</Text>
              <Text style={styles.documentDetails}>
                {doc.type} • {formatFileSize(doc.size)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveDocument(doc.id)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handlePickDocument}
      >
        <Text style={styles.addButtonText}>+ Добавить документ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.text,
  },
  documentsList: {
    maxHeight: 200,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  documentDetails: {
    fontSize: 12,
    color: COLORS.gray,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: COLORS.emergency,
    fontSize: 18,
  },
  addButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 