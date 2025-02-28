export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={`
                inline-flex items-center px-5 py-2 border border-transparent rounded-md font-semibold text-sm uppercase tracking-widest 
                transition transition-colors ease-in-out duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 
                bg-gradient-to-r from-purple-500 to-blue-500 text-white 
                hover:from-blue-400 hover:to-purple-400 
                active:bg-purple-700 focus:ring-indigo-500 
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${className}
            `}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
