import toast from "react-hot-toast";

interface ToastProps {
    message?: string;
}

export const successToast = ({ message }: ToastProps = {}) => {
    toast(message || "Success!", {
        icon: "✅",
    });
};

export const errorToast = ({ message }: ToastProps = {}) => {
    toast.error(message || "Error!", {
        icon: "❌",
    });
};
