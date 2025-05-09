import i18n from '../i18n';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // If less than a minute ago
  if (diff < 60000) {
    return i18n.t('time.justNow');
  }

  // If less than an hour ago
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return i18n.t('time.minutesAgo', { count: minutes });
  }

  // If less than a day ago
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return i18n.t('time.hoursAgo', { count: hours });
  }

  // If less than a week ago
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return i18n.t('time.daysAgo', { count: days });
  }

  // For older dates, return the full date
  return date.toLocaleDateString(i18n.language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
