import { forwardRef, useEffect, useRef } from "react";

export default forwardRef(function RadioInput(
  { className = "", isFocused = false, ...props },
  ref
) {
  const input = ref ? ref : useRef();

  useEffect(() => {
    if (isFocused) {
      input.current.focus();
    }
  }, []);

  return (
    <input
      {...props}
      type="radio"
      className={
        "border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 " +
        className
      }
      ref={input}
    />
  );
});
