import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: string;
  title: string;
  type: 'certificate' | 'diploma' | 'license';
  issueDate: string;
  expiryDate?: string;
  imageUrl: ImageSourcePropType;
  verified: boolean;
}

const DoctorDocumentsScreen: React.FC = () => {
  useAuth();
  const [documents] = useState<Document[]>([
    {
      id: '1',
      title: 'Диплом о высшем медицинском образовании',
      type: 'diploma',
      issueDate: '15.06.2018',
      imageUrl: require('../assets/images/document-placeholder.png'),
      verified: true,
    },
    {
      id: '2',
      title: 'Сертификат специалиста',
      type: 'certificate',
      issueDate: '20.03.2023',
      expiryDate: '20.03.2028',
      imageUrl: require('../assets/images/document-placeholder.png'),
      verified: true,
    },
    {
      id: '3',
      title: 'Лицензия на медицинскую деятельность',
      type: 'license',
      issueDate: '01.01.2022',
      expiryDate: '01.01.2027',
      imageUrl: require('../assets/images/document-placeholder.png'),
      verified: false,
    },
  ]);

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'diploma':
        return 'school';
      case 'certificate':
        return 'ribbon';
      case 'license':
        return 'document';
      default:
        return 'document';
    }
  };

  const getDocumentTypeText = (type: Document['type']) => {
    switch (type) {
      case 'diploma':
        return 'Диплом';
      case 'certificate':
        return 'Сертификат';
      case 'license':
        return 'Лицензия';
      default:
        return type;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Документы</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Всего документов</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Верифицировано</Text>
          </View>
        </View>
      </View>

      <View style={styles.documentsContainer}>
        {documents.map(document => (
          <TouchableOpacity key={document.id} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentTypeContainer}>
                <Ionicons
                  name={getDocumentIcon(document.type)}
                  size={24}
                  color={COLORS.light.primary}
                />
                <Text style={styles.documentType}>{getDocumentTypeText(document.type)}</Text>
              </View>
              {document.verified ? (
                <View style={[styles.badge, styles.verifiedBadge]}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.light.whiteBackground}
                  />
                  <Text style={styles.badgeText}>Верифицирован</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.pendingBadge]}>
                  <Ionicons name="time" size={16} color={COLORS.light.whiteBackground} />
                  <Text style={styles.badgeText}>На проверке</Text>
                </View>
              )}
            </View>

            <Text style={styles.documentTitle}>{document.title}</Text>

            <View style={styles.documentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Дата выдачи:</Text>
                <Text style={styles.detailValue}>{document.issueDate}</Text>
              </View>
              {document.expiryDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Действителен до:</Text>
                  <Text style={styles.detailValue}>{document.expiryDate}</Text>
                </View>
              )}
            </View>

            <Image source={document.imageUrl} style={styles.documentImage} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.light.whiteBackground,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  detailLabel: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailValue: {
    color: COLORS.light.text,
    fontSize: 14,
    fontWeight: '500',
  },
  documentCard: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  documentDetails: {
    marginTop: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  documentImage: {
    borderRadius: 8,
    height: 200,
    marginTop: 16,
    width: '100%',
  },
  documentTitle: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  documentType: {
    color: COLORS.light.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  documentTypeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  documentsContainer: {
    padding: 16,
  },
  header: {
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
  },
  pendingBadge: {
    backgroundColor: COLORS.light.warning,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  statValue: {
    color: COLORS.light.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  title: {
    color: COLORS.light.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    backgroundColor: COLORS.light.success,
  },
});

export default DoctorDocumentsScreen;
