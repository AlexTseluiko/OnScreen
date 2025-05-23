import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  actionButton: {
    borderRadius: 8,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontWeight: 'bold',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    marginRight: 8,
    padding: 10,
  },
  inputContainer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 8,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  message: {
    borderRadius: 10,
    marginBottom: 12,
    maxWidth: '85%',
    padding: 12,
  },
  messageText: {
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
});
