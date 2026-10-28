import Swal from 'sweetalert2';

export const showSuccessAlert = async (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    background: '#18181b',
    color: '#ffffff',
    confirmButtonColor: '#10b981',
    customClass: {
      popup: 'border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md',
      title: 'text-zinc-100 font-bold font-sans',
      htmlContainer: 'text-zinc-400 text-sm font-sans',
      confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all',
    },
    buttonsStyling: false,
  });
};

export const showErrorAlert = async (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    background: '#18181b',
    color: '#ffffff',
    confirmButtonColor: '#ef4444',
    customClass: {
      popup: 'border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md',
      title: 'text-zinc-100 font-bold font-sans',
      htmlContainer: 'text-zinc-400 text-sm font-sans',
      confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white cursor-pointer transition-all',
    },
    buttonsStyling: false,
  });
};

export const showWarningAlert = async (title: string, text?: string) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    background: '#18181b',
    color: '#ffffff',
    confirmButtonColor: '#f59e0b',
    customClass: {
      popup: 'border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md',
      title: 'text-zinc-100 font-bold font-sans',
      htmlContainer: 'text-zinc-400 text-sm font-sans',
      confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-all',
    },
    buttonsStyling: false,
  });
};

export const showConfirmAlert = async (
  title: string,
  text?: string,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel'
) => {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text,
    background: '#18181b',
    color: '#ffffff',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      popup: 'border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md',
      title: 'text-zinc-100 font-bold font-sans',
      htmlContainer: 'text-zinc-400 text-sm font-sans',
      confirmButton: 'px-5 py-2.5 mr-2 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all',
      cancelButton: 'px-5 py-2.5 rounded-xl font-bold text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 cursor-pointer transition-all',
    },
    buttonsStyling: false,
  });
  return result.isConfirmed;
};

export default {
  success: showSuccessAlert,
  error: showErrorAlert,
  warning: showWarningAlert,
  confirm: showConfirmAlert,
};
