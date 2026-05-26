import { useCallback } from 'react';

export const useToast = () => {
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    if (typeof window === 'undefined') return;

    let container = document.getElementById('custom-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'custom-toast-container';
      container.className = 'fixed bottom-4 right-4 z-99999 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    // Styled beautifully using Tailwind CSS classes present in the template!
    const bgClass = type === 'success' ? 'bg-success-500' : type === 'error' ? 'bg-error-500' : 'bg-gray-800';
    toast.className = `px-4 py-3 rounded-lg text-white text-sm shadow-lg transition-all duration-300 transform translate-y-2 opacity-0 flex items-center gap-2 pointer-events-auto ${bgClass}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger animate-in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    // Remove after 3s
    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => {
        toast.remove();
        if (container && container.childNodes.length === 0) {
          container.remove();
        }
      }, 300);
    }, 3000);
  }, []);

  return {
    success: useCallback((msg: string) => showToast(msg, 'success'), [showToast]),
    error: useCallback((msg: string) => showToast(msg, 'error'), [showToast]),
    warning: useCallback((msg: string) => showToast(msg, 'warning'), [showToast]),
    info: useCallback((msg: string) => showToast(msg, 'info'), [showToast]),
  };
};
