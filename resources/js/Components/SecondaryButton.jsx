export default function SecondaryButton({ type = 'button', className = '', disabled, children, ...props }) {
    return (
        <button
        {...props}
        className={`
            inline-flex items-center px-5 py-2 border rounded-md font-semibold text-sm uppercase tracking-widest 
            transition transition-colors ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
            bg-blue-500 text-white hover:bg-sky-300 
            dark:bg-sky-700 dark:text-white dark:hover:bg-gray-600 
            focus:ring-gray-500 
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
        `}
        disabled={disabled}
    >
        {children}
    </button>
    );
}
