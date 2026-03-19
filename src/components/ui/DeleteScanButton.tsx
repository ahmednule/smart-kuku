"use client";

import React from "react";

type DeleteScanButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage?: string;
};

const DeleteScanButton = ({
  action,
  confirmMessage = "Are you sure you want to delete this scan?",
}: DeleteScanButtonProps) => {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
      >
        Delete
      </button>
    </form>
  );
};

export default DeleteScanButton;
