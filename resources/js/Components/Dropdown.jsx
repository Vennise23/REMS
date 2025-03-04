import { useState, createContext, useContext, Fragment } from 'react';
import { Link } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children, notify = 0,className='' }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen} className={`cursor-pointer ${className}`}>
                {children}
                {notify > 0 && (
                    <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1 py-1/2`}>
                        {notify}
                    </span>
                )}
            </div>

            {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>}
        </>
    );
};

const Content = ({ align = 'right', width = '48', contentClasses = 'py-1 bg-white dark:bg-gray-700', children }) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div className={`rounded-md ring-1 ring-black ring-opacity-5 ` + contentClasses}>{children}</div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 transition duration-150 ease-in-out ' +
                (className !== '' ? className : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800')
            }
        >
            {children}
        </Link>
    );
};

const Title = ({ children }) => {
    return (
        <h3 className={'block w-full px-4 py-2 text-start leading-5 text-gray-500 dark:text-gray-300 text-lg font-semibold'}>
            {children}
        </h3>
    )
}

const Text = ({ children }) => {
    return (
        <div className={'block w-full px-4 py-2 text-start leading-5 text-gray-500 dark:text-gray-300 text-sm font-semibold'}>
            {children}
        </div>
    )
}

const BoxLink = ({ children, title, notify = 0 }) => {
    return (
        <div className="flex-1">
            <div className="font-medium">
                {title}
            </div>
            <div className="text-sm text-gray-500">
                {children}
            </div>
            {notify > 0 && (
                <span className="flex-shrink-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notify}
                </span>
            )}
        </div>
    )
}

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;
Dropdown.Title = Title;
Dropdown.Text = Text;
Dropdown.BoxLink = BoxLink;

export default Dropdown;
