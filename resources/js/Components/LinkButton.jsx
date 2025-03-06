export default function LinkButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={`
                inline-flex items-center px-5 py-2 border-none rounded-md font-semibold text-sm uppercase tracking-widest
                transition-colors ease-in-out duration-500 focus:outline-none focus:ring-0
                bg-transparent shadow-none  
                text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500  
                hover:from-blue-400 hover:to-purple-400
                active:opacity-80
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${className}
            `}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
