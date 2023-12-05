import React, { ReactNode } from "react";

const Modal: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div
      id="staticModal"
      data-modal-backdrop="static"
      tabIndex={-1}
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 z-40 w-screen h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center `}
    >
      <div
        className={`relative max-h-full flex items-center justify-center bg-white w-1/2 rounded-lg ${
          className ?? ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
