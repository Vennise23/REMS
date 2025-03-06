export default function DangerButton({ className = '', disabled, children, ...props }) {
    const hasPaddingX = /\bpx-\d+\b/.test(className);
    const hasPaddingY = /\bpy-\d+\b/.test(className);
    return (
        <button
            {...props}
            className={`
                inline-flex items-center  ${hasPaddingX ? '' : 'px-5'}  ${hasPaddingY ? '' : 'py-2'}  border border-transparent rounded-md font-semibold text-sm uppercase tracking-widest 
                transition transition-colors ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
                bg-gradient-to-r from-red-500 to-pink-500 text-white 
                hover:from-pink-400 hover:to-red-400 
                active:bg-pink-700 focus:ring-pink-500 
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${className}
            `}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
