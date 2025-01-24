import { toast } from 'react-toastify';

// Default Success Toast
export const showSuccessToast = (message: string, options = {}) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options, // Merge with additional options
  });
};

// Default Error Toast
export const showErrorToast = (message: string, options = {}) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options, // Merge with additional options
  });
};
