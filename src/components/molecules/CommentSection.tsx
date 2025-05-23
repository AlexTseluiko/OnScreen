import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { commentsApi } from '../../api/commentsApi';
import { Comment } from '../../types/comment';
import { COLORS } from '../../theme/colors';

interface CommentSectionProps {
  articleId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await commentsApi.getArticleComments(articleId, page);
        if (response.data) {
          if (page === 1) {
            setComments(response.data.comments);
          } else {
            setComments(prev => [...prev, ...response.data.comments]);
          }
          setHasMore(response.data.currentPage < response.data.pages);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        Alert.alert(t('comments.error'), t('comments.errorLoading'));
      } finally {
        setLoading(false);
      }
    },
    [articleId, t]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await commentsApi.createComment(articleId, {
        content: newComment,
        parentCommentId: replyTo || undefined,
      });

      if (response.data) {
        if (replyTo) {
          // Обновляем список ответов в родительском комментарии
          setComments(prev =>
            prev.map(comment =>
              comment._id === replyTo
                ? { ...comment, replies: [...(comment.replies || []), response.data] }
                : comment
            )
          );
        } else {
          // Добавляем новый комментарий в начало списка
          setComments(prev => [response.data, ...prev]);
        }
        setNewComment('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert(t('comments.error'), t('comments.errorSubmitting'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const response = await commentsApi.likeComment(commentId);
      if (response.data) {
        setComments(prev =>
          prev.map(comment =>
            comment._id === commentId ? { ...comment, likes: response.data.likes } : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const renderComment = ({ item: comment }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <View style={styles.authorInfo}>
          <Ionicons name="person-circle" size={24} color={theme.colors.primary} />
          <Text style={[styles.authorName, { color: theme.colors.text }]}>
            {comment.author.firstName} {comment.author.lastName}
          </Text>
        </View>
        <Text style={[styles.commentDate, { color: theme.colors.textSecondary }]}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.commentContent, { color: theme.colors.text }]}>{comment.content}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setReplyTo(comment._id)}>
          <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>
            {t('comments.reply')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(comment._id)}>
          <Ionicons name="heart-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>{comment.likes}</Text>
        </TouchableOpacity>
      </View>
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map(reply => (
            <View key={reply._id} style={styles.replyContainer}>
              <View style={styles.replyHeader}>
                <View style={styles.authorInfo}>
                  <Ionicons name="person-circle" size={20} color={theme.colors.primary} />
                  <Text style={[styles.authorName, { color: theme.colors.text }]}>
                    {reply.author.firstName} {reply.author.lastName}
                  </Text>
                </View>
                <Text style={[styles.commentDate, { color: theme.colors.textSecondary }]}>
                  {new Date(reply.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.commentContent, { color: theme.colors.text }]}>
                {reply.content}
              </Text>
              <View style={styles.commentActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(reply._id)}>
                  <Ionicons name="heart-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                    {reply.likes}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('comments.title')}</Text>
      {token && (
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder={replyTo ? t('comments.replyPlaceholder') : t('comments.placeholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.palette.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.palette.white} />
            )}
          </TouchableOpacity>
        </View>
      )}
      {replyTo && (
        <View style={styles.replyingToContainer}>
          <Text style={[styles.replyingToText, { color: theme.colors.textSecondary }]}>
            {t('comments.replyingTo')}
          </Text>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item._id}
          onEndReached={() => {
            if (hasMore) {
              setCurrentPage(prev => prev + 1);
              fetchComments(currentPage + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('comments.noComments')}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
  },
  authorInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  authorName: {
    fontWeight: '500',
    marginLeft: 8,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  commentDate: {
    fontSize: 12,
  },
  commentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: COLORS.palette.gray[300],
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
    padding: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  loader: {
    marginTop: 20,
  },
  repliesContainer: {
    marginLeft: 24,
    marginTop: 8,
  },
  replyContainer: {
    marginBottom: 12,
  },
  replyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  replyingToContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  replyingToText: {
    marginRight: 8,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
