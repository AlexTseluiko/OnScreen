import { COLORS } from '../constants/colors';

export const showToast = (message: string): void => {
  if (typeof document !== 'undefined') {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = COLORS.gray[900];
    toast.style.color = COLORS.white;
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '9999';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  } else {
    console.log('Toast message:', message);
  }
};
